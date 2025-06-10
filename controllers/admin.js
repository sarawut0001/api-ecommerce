const prisma = require("../config/prisma");

exports.changOrderStatus = async (req, res) => {
  try {
    const { orderId, orderStatus } = req.body;

    const orderUpdate = await prisma.order.update({
      where: { id: orderId },
      data: { orderStatus },
    });

    res.json(orderUpdate);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.getOrderAdmin = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        products: {
          include: { product: true },
        },
        orderBy: {
          select: {
            id: true,
            email: true,
            address: true,
          },
        },
      },
    });

    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};
