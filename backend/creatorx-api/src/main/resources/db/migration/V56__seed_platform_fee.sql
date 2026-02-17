-- V56: Seed default platform commission (10%)
-- Without this row, WalletService defaults to 0% fee on creator earnings
INSERT INTO platform_settings (setting_key, setting_value, data_type, description)
VALUES ('FEES_PLATFORM_COMMISSION_PERCENT', '10', 'NUMBER', 'Platform commission percentage on creator earnings')
ON CONFLICT (setting_key) DO NOTHING;
