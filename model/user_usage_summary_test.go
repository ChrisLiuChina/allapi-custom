package model

import (
	"testing"

	"github.com/stretchr/testify/require"
)

func TestGetUserUsageSummaryGroupsSuccessfulUsageByUser(t *testing.T) {
	truncateTables(t)
	require.NoError(t, LOG_DB.Create(&Log{
		UserId: 1, Username: "alice", Type: LogTypeConsume, CreatedAt: 100,
		Quota: 20, PromptTokens: 3, CompletionTokens: 7,
	}).Error)
	require.NoError(t, LOG_DB.Create(&Log{
		UserId: 1, Username: "alice", Type: LogTypeConsume, CreatedAt: 110,
		Quota: 10, PromptTokens: 2, CompletionTokens: 5,
	}).Error)
	require.NoError(t, LOG_DB.Create(&Log{
		UserId: 2, Username: "bob", Type: LogTypeConsume, CreatedAt: 120,
		Quota: 25, PromptTokens: 8, CompletionTokens: 1,
	}).Error)
	require.NoError(t, LOG_DB.Create(&Log{
		UserId: 1, Username: "alice", Type: LogTypeTopup, CreatedAt: 130,
		Quota: 999,
	}).Error)

	items, err := GetUserUsageSummary(0, 0, "", 0, "")
	require.NoError(t, err)
	require.Len(t, items, 2)
	require.Equal(t, "alice", items[0].Username)
	require.Equal(t, 2, items[0].RequestCount)
	require.Equal(t, 30, items[0].Quota)
	require.Equal(t, 17, items[0].TokenCount)
	require.Equal(t, "bob", items[1].Username)
	require.Equal(t, 1, items[1].RequestCount)
	require.Equal(t, 25, items[1].Quota)
}
