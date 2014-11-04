# -*- coding: utf-8 -*-
# e-commerce
SHOP_SECONDARY_CURRENCIES = True
SHOP_ADDRESS_MODEL = 'ashop.addressmodel.models.L10nAddress'

#SHOP_PRODUCT_MODEL = 'ashop.models.SiteAwareProduct'

SHOP_SHIPPING_BACKENDS = (
    #'shop.shipping.backends.flat_rate.FlatRateShipping',
    #'ashop.shipping.SkipShippingBackend',
    'shipping_provider.shipping.CountryRateShipping',
)

# !!!!!!!!! in case of SkipShippingBackend you must set SHOP_SKIP_SHIPPING to True
SHOP_SKIP_SHIPPING = False

SHOP_PAYMENT_BACKENDS = (
    #'shop_paypal.offsite_paypal.OffsitePaypalBackend',
    'shop_datatrans.offsite_datatrans.DatatransBackend',
    'shop_authorize.onsite_authorize.OnsiteAuthorizeBackend',
    #'shop.payment.backends.pay_on_delivery.PayOnDeliveryBackend',
    'shop_postpay.postpay.PostPayBackend',
)
SHOP_CART_MODIFIERS = (
    #'shop_simplevariations.cart_modifier.ProductOptionsModifier',
    #'ashop.modifiers.BulkRebateModifier',
    #'discount.cart_modifiers.DiscountCartModifier',
    #'ashop.modifiers.FixedTaxRate',
    #'ashop.modifiers.FixedShippingCosts',
    'area_tax.modifiers.AreaTax',
)
SHOP_BASE_CURRENCY = {
    'code': 'CHF',
    'character': 'CHF',
    'separator': ' ',
}
DJANGO_SHOP_AREA_TAX = {
    'TAX_SHIPPING_ADDRESS': True,
    'DEFAULT_TAX': 0.08,
    'DEFAULT_COUNTRY_CODE': 'CH', 
}

# shippment
DEFAULT_SHIPPING_COSTS = 10

# payment providers

# datatrans gateway
SHOP_DATATRANS_TEST_MODE = True
SHOP_DATATRANS_MERCHANT_ID = '1100001228'
SHOP_DATATRANS_SIGNATURE = '4da5978912f0b97a8970403ebe0c2a367cb9a9c0845415b98e1410b5440874060daa128836c75dabd3affcd53ddb906ec38cdd0d6eeb301494bc41ce7717277b'
SHOP_DATATRANS_CURRENCY = SHOP_BASE_CURRENCY['code']

# authorize gateway
AUTHORIZE_PSP_ID = '4pU57U2xMC'
AUTHORIZE_API_ID = '4pU57U2xMC'
AUTHORIZE_SECRET_KEY = '5773uwLXj2T4Nq9G'
AUTHORIZE_TRANSACTION_KEY = '5773uwLXj2T4Nq9G'
AUTHORIZE_CURRENCY = SHOP_BASE_CURRENCY['code']

# qb
QUICKBOOKS = {
    'CONSUMER_KEY': 'qyprd7jb8XSDsZGk6PZ7FeB3hLdJwZ',
    'CONSUMER_SECRET': 'ffSMPWqNm0EojJgiruiaatm7a7B72AnPnpR5IUbO',
    #'CONSUMER_KEY': 'qyprdrbLmoYqVa83WfTm54Bd7ETQg2',
    #'CONSUMER_SECRET': '4m4SlTi6qg2nJnFbwADaRdWgfQQGlr2Dz5vyZpBz',
    'OAUTH_CALLBACK_URL': 'http://ohrstrom-local.anorg.net/en/qb/get_access_token/',
}