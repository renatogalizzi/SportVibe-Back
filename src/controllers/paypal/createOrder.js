const axios = require("axios");
const { Order } = require("../../db");
const { HOST, PAYPAL_URL, PAYPAL_CLIENT, PAYPAL_SECRET_KEY } = require("../../../config");

const createOrder = async (req, res) => {
  try {
    const { userId, ShoppingCartId, total } = req.body;
    console.log(total);
    const order = {
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "usd",
            value: total,
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

    const { data: capturedOrder } = await axios.post(`${PAYPAL_URL}/v2/checkout/orders`, order, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    const { id } = capturedOrder;

    // Crear una entrada en la base de datos usando el modelo Order
    const newOrder = await Order.create({
      orderIdPaypal: id,
      userId,
      ShoppingCartId,
      total,
    });

    return res.json(capturedOrder.links[1].href);
  } catch (error) {
    console.log("Error al crear la orden:", error);
    return res.status(500).json({ error: "Error Interno del Servidor" });
  }
};

module.exports = createOrder;
