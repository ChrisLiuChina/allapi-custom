package model

import (
	"testing"

	"github.com/stretchr/testify/require"
)

func TestRecordAffiliateCommissionCreditsInviterExactlyOnce(t *testing.T) {
	truncateTables(t)

	inviter := User{Username: "commission-inviter", Password: "hash", AffCode: "inv1", Quota: 100}
	require.NoError(t, DB.Create(&inviter).Error)
	invitee := User{Username: "commission-invitee", Password: "hash", AffCode: "inv2", InviterId: inviter.Id}
	require.NoError(t, DB.Create(&invitee).Error)

	commission, granted, err := RecordAffiliateCommission(invitee.Id, "request-commission-1", 25)
	require.NoError(t, err)
	require.True(t, granted)
	require.Equal(t, 2, commission)

	commission, granted, err = RecordAffiliateCommission(invitee.Id, "request-commission-1", 25)
	require.NoError(t, err)
	require.False(t, granted)
	require.Zero(t, commission)

	var reloadedInviter User
	require.NoError(t, DB.First(&reloadedInviter, inviter.Id).Error)
	require.Equal(t, 102, reloadedInviter.Quota)

	var rows int64
	require.NoError(t, DB.Model(&AffiliateCommission{}).Count(&rows).Error)
	require.EqualValues(t, 1, rows)
}
