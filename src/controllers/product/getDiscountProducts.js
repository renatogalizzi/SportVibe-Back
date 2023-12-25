const { Product, Stock, Image, Color, Size } = require("../../db");
const { Op } = require('sequelize');

const getDiscountProducts = async (req, res) => {
    try {
        const products = await Product.findAll({
            where: {
                discount: {
                    [Op.gt]: 0
                },
            },
            include: [
                {
                    model: Stock,
                    include: [{ model: Size, attributes: ["name"] }],
                },
                {
                    model: Image,
                    attributes: ["url"],
                    through: { attributes: [] },
                },
                {
                    model: Color,
                    attributes: ["name"],
                    through: { attributes: [] },
                },
            ],
            order: [
                ['discount', 'DESC'], // Ordena por la propiedad 'discount' en orden descendente (de mayor a menor)
            ],
        });
        if (products && products.length) {
            res.json(products);
        }
        res.status(404).json('no hay productos con descuentos')
    } catch (error) {
        console.error({ error: error.message });
        res.status(500).json({ error: error.message });
    }
};

module.exports = getDiscountProducts;