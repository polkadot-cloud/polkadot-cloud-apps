// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

// Enhanced technical error classification
export const getErrorKeyFromMessage = (errorMessage: string): string => {
	const msgLower = errorMessage.toLowerCase()

	// Signer-related errors
	if (/signer|signature|signing/.test(msgLower)) {
		if (/missing|not found|undefined/.test(msgLower)) {
			return 'missing_signer'
		}
		if (/invalid|failed|error/.test(msgLower)) {
			return 'invalid_signer'
		}
		if (/timeout|timed out/.test(msgLower)) {
			return 'signer_timeout'
		}
		return 'signer_error'
	}

	// Network connectivity errors
	if (/network|connection|connectivity/.test(msgLower)) {
		if (/timeout|timed out/.test(msgLower)) {
			return 'network_timeout'
		}
		if (/disconnected|offline/.test(msgLower)) {
			return 'network_disconnected'
		}
		if (/unreachable|failed to connect/.test(msgLower)) {
			return 'network_unreachable'
		}
		return 'network_error'
	}

	// Transaction parameter errors
	if (/parameter|argument|invalid/.test(msgLower)) {
		if (/nonce|sequence/.test(msgLower)) {
			return 'invalid_nonce'
		}
		if (/fee|payment/.test(msgLower)) {
			return 'invalid_fee'
		}
		if (/call|method/.test(msgLower)) {
			return 'invalid_call'
		}
		return 'invalid_parameters'
	}

	// Hardware wallet specific errors
	if (/ledger|hardware|device/.test(msgLower)) {
		if (/locked|unlock/.test(msgLower)) {
			return 'device_locked'
		}
		if (/busy|in use/.test(msgLower)) {
			return 'device_busy'
		}
		if (/not connected|disconnected/.test(msgLower)) {
			return 'device_disconnected'
		}
		if (/app not open|open app/.test(msgLower)) {
			return 'app_not_open'
		}
		return 'hardware_error'
	}

	// Wallet Connect errors
	if (/wallet.?connect|wc/.test(msgLower)) {
		if (/session|disconnected/.test(msgLower)) {
			return 'wc_session_disconnected'
		}
		if (/timeout|timed out/.test(msgLower)) {
			return 'wc_timeout'
		}
		return 'wallet_connect_error'
	}

	// Vault/QR code errors
	if (/vault|qr|qrcode/.test(msgLower)) {
		if (/scan|read/.test(msgLower)) {
			return 'qr_scan_error'
		}
		if (/invalid|failed/.test(msgLower)) {
			return 'qr_invalid'
		}
		return 'vault_error'
	}

	// Runtime/version errors
	if (/runtime|version|metadata/.test(msgLower)) {
		if (/incompatible|mismatch/.test(msgLower)) {
			return 'runtime_incompatible'
		}
		if (/not supported|unsupported/.test(msgLower)) {
			return 'runtime_unsupported'
		}
		return 'runtime_error'
	}

	// Pool-specific errors
	if (/pool|nomination.?pool/.test(msgLower)) {
		if (/full|maximum|limit|exceeded/.test(msgLower)) {
			return 'pool_full'
		}
		if (/blocked|blocking/.test(msgLower)) {
			return 'pool_blocked'
		}
		if (/destroying|destroyed/.test(msgLower)) {
			return 'pool_destroying'
		}
		if (/invalid.?state|state/.test(msgLower)) {
			return 'pool_invalid_state'
		}
		if (/invalid.?id|pool.?id/.test(msgLower)) {
			return 'validation_error_invalid_pool_id'
		}
		return 'pool_error'
	}

	// Staking-specific errors
	if (/staking|stake|bond/.test(msgLower)) {
		if (/minimum|min.?bond|below/.test(msgLower)) {
			return 'staking_error_min_bond'
		}
		if (/maximum|max.?nominations|16/.test(msgLower)) {
			return 'staking_error_max_nominations'
		}
		if (/era|epoch|session/.test(msgLower)) {
			return 'staking_error_era_constraint'
		}
		return 'staking_error'
	}

	// Commission errors
	if (/commission|comission/.test(msgLower)) {
		if (/exceeds|above|maximum|max/.test(msgLower)) {
			if (/global/.test(msgLower)) {
				return 'commission_error_exceeds_global'
			}
			return 'commission_error_exceeds_max'
		}
		if (/change.?rate|rate.?change/.test(msgLower)) {
			return 'commission_error_change_rate'
		}
		if (/payee|recipient/.test(msgLower)) {
			return 'commission_error_invalid_payee'
		}
		return 'commission_error'
	}

	// Balance and fee errors
	if (/balance|fee|payment/.test(msgLower)) {
		if (/reserve|locked|freeze/.test(msgLower)) {
			return 'balance_error_locked'
		}
		if (/reserve|minimum/.test(msgLower)) {
			return 'balance_error_reserve_required'
		}
		if (/calculation|compute/.test(msgLower)) {
			return 'balance_error_fee_calculation'
		}
		return 'balance_error'
	}

	// Validation errors
	if (/validation|validate|invalid/.test(msgLower)) {
		if (/address|format/.test(msgLower)) {
			return 'validation_error_address_format'
		}
		if (/metadata|length/.test(msgLower)) {
			return 'validation_error_metadata_too_long'
		}
		if (/parameter|range/.test(msgLower)) {
			return 'validation_error_parameter_range'
		}
		if (/validator/.test(msgLower)) {
			return 'validation_error_invalid_validator'
		}
		return 'validation_error'
	}

	// Generic technical errors
	if (/timeout|timed out/.test(msgLower)) {
		return 'general_timeout'
	}
	if (/permission|access/.test(msgLower)) {
		return 'permission_denied'
	}
	if (/quota|limit/.test(msgLower)) {
		return 'rate_limited'
	}

	return 'unknown_technical'
}
