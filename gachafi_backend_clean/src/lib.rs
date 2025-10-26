use scrypto::prelude::*;

#[derive(ScryptoSbor, NonFungibleData)]
pub struct GachaFiBadgeData {
    tier: String,
    opened_at: i64,
    nonce: u64,
}

#[blueprint]
mod gachafi {
    struct GachaFi {
        xrd_vault: Vault,
        badge_resource_address: ResourceAddress,
        badge_tiers: HashMap<String, Decimal>,
    }
    impl GachaFi {
        pub fn instantiate() -> Global<GachaFi> {
            let badge_manager = ResourceBuilder::new_ruid_non_fungible::<GachaFiBadgeData>(OwnerRole::None)
                .metadata(metadata!{ init { "name" => "GachaFi Badge", locked; "symbol" => "GFB", locked; } })
                .mint_roles(mint_roles!{ minter => rule!(allow_all); minter_updater => rule!(deny_all); })
                .burn_roles(burn_roles!{ burner => rule!(allow_all); burner_updater => rule!(deny_all); })
                .create_with_no_initial_supply();
            let badge_resource_address = badge_manager.address();
            let mut badge_tiers = HashMap::new();
            badge_tiers.insert("common".to_string(), dec!(8));
            badge_tiers.insert("rare".to_string(), dec!(15));
            badge_tiers.insert("epic".to_string(), dec!(25));
            Self {
                xrd_vault: Vault::new(XRD),
                badge_resource_address,
                badge_tiers,
            }.instantiate().prepare_to_globalize(OwnerRole::None).globalize()
        }
        pub fn mint_gacha_badge(&mut self, mut payment: Bucket, tier: String, nonce: u64) -> Bucket {
            assert!(self.badge_tiers.contains_key(&tier), "Invalid tier!");
            let required_xrd = self.badge_tiers[&tier];
            assert!(payment.amount() >= required_xrd, "Insufficient payment!");
            self.xrd_vault.put(payment.take(required_xrd));
            let badge_data = GachaFiBadgeData { tier: tier.clone(), opened_at: Clock::current_time(TimePrecision::Minute).seconds_since_unix_epoch, nonce };
            let res_manager: NonFungibleResourceManager = self.badge_resource_address.into();
            let nft_bucket = res_manager.mint_ruid_non_fungible(badge_data);
            nft_bucket.into()
        }
    }
}
