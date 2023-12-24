const axios = require("axios");
const { HOST, PAYPAL_URL, PAYPAL_CLIENT, PAYPAL_SECRET_KEY } = require("../../../config");

const createOrder = async (req, res) => {
  const order = {
    intent: "CAPTURE",
    purchase_units: [
      {
        amount: {
          currency_code: "usd",
          value: "130.00",
        },
      },
    ],
    application_context: {
      brand_name: "SportVibe",
      landing_page: "NO_PREFERENCE",
      user_action: "PAY_NOW",
      return_url: `${HOST}/capture-order`,
      cancel_url: `${HOST}/cancel-order`,
    },
  };
  const params = new URLSearchParams();
  params.append("grant_type", "client_credentials");

  const {
    data: { access_token },
  } = await axios.post(`${PAYPAL_URL}/v1/oauth2/token`, params, {
    auth: {
      username: PAYPAL_CLIENT,
      password: PAYPAL_SECRET_KEY,
    },
  });

  const response = await axios.post(`${PAYPAL_URL}/v2/checkout/orders`, order, {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });
  console.log(response.data);
  return res.json(response.data.links[1].href);
};

module.exports = createOrder;
