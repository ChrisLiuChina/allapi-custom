package model

import (
	"errors"
	"time"

	"github.com/QuantumNous/new-api/common"
	"github.com/bytedance/gopkg/util/gopool"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

// ReferralInvitee is intentionally privacy-safe: it never contains tokens,
// usage, request logs, IP addresses, email addresses, or the user ID.
type ReferralInvitee struct {
	Username        string `json:"username"`
	CreatedAt       int64  `json:"created_at"`
	Status          int    `json:"status"`
	CommissionQuota int    `json:"commission_quota"`
}

type ReferralSummary struct {
	InviteeCount         int               `json:"invitee_count"`
	TotalCommissionQuota int               `json:"total_commission_quota"`
	Invitees             []ReferralInvitee `json:"invitees"`
}

// AffiliateCommission is an immutable, idempotent record of a commission
// credited to an inviter for one successfully settled request.
type AffiliateCommission struct {
	Id              int    `json:"id"`
	InviterId       int    `json:"inviter_id" gorm:"index"`
	InviteeId       int    `json:"invitee_id" gorm:"index"`
	RequestId       string `json:"request_id" gorm:"type:varchar(64);uniqueIndex"`
	ConsumedQuota   int    `json:"consumed_quota"`
	CommissionQuota int    `json:"commission_quota"`
	CreatedAt       int64  `json:"created_at" gorm:"autoCreateTime;index"`
}

// RecordAffiliateCommission credits 10% of a positive, final request charge to
// the direct inviter's main balance. The request ID is unique, so retries can
// never credit the same request twice.
func RecordAffiliateCommission(inviteeId int, requestId string, consumedQuota int) (commission int, granted bool, err error) {
	if inviteeId <= 0 || requestId == "" || consumedQuota <= 0 {
		return 0, false, nil
	}
	commission = consumedQuota / 10
	if commission <= 0 {
		return 0, false, nil
	}

	inviterId := 0
	err = DB.Transaction(func(tx *gorm.DB) error {
		var invitee User
		if err := tx.Select("id", "inviter_id").First(&invitee, inviteeId).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return nil
			}
			return err
		}
		if invitee.InviterId <= 0 || invitee.InviterId == invitee.Id {
			return nil
		}
		inviterId = invitee.InviterId

		record := AffiliateCommission{
			InviterId:       invitee.InviterId,
			InviteeId:       invitee.Id,
			RequestId:       requestId,
			ConsumedQuota:   consumedQuota,
			CommissionQuota: commission,
			CreatedAt:       time.Now().Unix(),
		}
		result := tx.Clauses(clause.OnConflict{
			Columns:   []clause.Column{{Name: "request_id"}},
			DoNothing: true,
		}).Create(&record)
		if result.Error != nil {
			return result.Error
		}
		if result.RowsAffected == 0 {
			commission = 0
			return nil
		}

		result = tx.Model(&User{}).Where("id = ?", invitee.InviterId).
			Update("quota", gorm.Expr("quota + ?", commission))
		if result.Error != nil {
			return result.Error
		}
		if result.RowsAffected != 1 {
			return errors.New("inviter not found when recording affiliate commission")
		}
		granted = true
		return nil
	})
	if err != nil || !granted {
		return commission, granted, err
	}

	// Keep the cached main balance aligned after the database transaction commits.
	gopool.Go(func() {
		if cacheErr := cacheIncrUserQuota(inviterId, int64(commission)); cacheErr != nil {
			common.SysLog("failed to update affiliate commission cache: " + cacheErr.Error())
		}
	})
	return commission, true, nil
}

func GetReferralSummary(inviterId int) (*ReferralSummary, error) {
	summary := &ReferralSummary{Invitees: make([]ReferralInvitee, 0)}
	if inviterId <= 0 {
		return summary, nil
	}

	if err := DB.Table("users AS invitees").
		Select("invitees.username, invitees.created_at, invitees.status, COALESCE(SUM(affiliate_commissions.commission_quota), 0) AS commission_quota").
		Joins("LEFT JOIN affiliate_commissions ON affiliate_commissions.invitee_id = invitees.id").
		Where("invitees.inviter_id = ? AND invitees.deleted_at IS NULL", inviterId).
		Group("invitees.id, invitees.username, invitees.created_at, invitees.status").
		Order("invitees.created_at DESC").
		Scan(&summary.Invitees).Error; err != nil {
		return nil, err
	}
	for index := range summary.Invitees {
		summary.Invitees[index].Username = maskReferralUsername(summary.Invitees[index].Username)
		summary.InviteeCount++
		summary.TotalCommissionQuota += summary.Invitees[index].CommissionQuota
	}
	return summary, nil
}

func maskReferralUsername(username string) string {
	runes := []rune(username)
	switch len(runes) {
	case 0:
		return "***"
	case 1:
		return "*"
	case 2:
		return string(runes[0]) + "*"
	default:
		return string(runes[0]) + "***" + string(runes[len(runes)-1])
	}
}
