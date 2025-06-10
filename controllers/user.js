const prisma = require("../config/prisma");

exports.listUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        enable: true,
        address: true,
      },
    });

    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Sever Error" });
  }
};

exports.changeStatus = async (req, res) => {
  try {
    const { id, enable } = req.body;
    await prisma.user.update({
      where: { id: Number(id) },
      data: { enable },
    });
    res.json({ message: "Update status successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Sever Error" });
  }
};

exports.changeRole = async (req, res) => {
  try {
    const { id, role } = req.body;
    await prisma.user.update({
      where: { id: Number(id) },
      data: { role },
    });
    res.json({ message: "Update role successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Sever Error" });
  }
};

exports.userCart = async (req, res) => {
  try {
    const { cart } = req.body;

    const user = await prisma.user.findFirst({
      where: { id: Number(req.user.id) },
    });

    await prisma.productOnCart.deleteMany({
      where: {
        cart: { orderById: user.id },
      },
    });
    await prisma.cart.deleteMany({
      where: { orderById: user.id },
    });

    let products = cart.map((item) => ({
      productId: item.id,
      count: item.count,
      price: item.price,
    }));

    let cartTotal = products.reduce(
      (sum, item) => sum + item.price * item.count,
      0
    );

    const newCart = await prisma.cart.create({
      data: {
        products: {
          create: products,
        },
        cartTotal: cartTotal,
        orderById: user.id,
      },
    });

    console.log(newCart);
    res.json({ message: "Add cart successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Sever Error" });
  }
};

exports.getUserCart = async (req, res) => {
  try {
    const cart = await prisma.cart.findFirst({
      where: {
        orderById: Number(req.user.id),
      },
      include: {
        products: {
          include: {
            product: true,
          },
        },
      },
    });

    res.json({
      products: cart.products,
      cartTotal: cart.cartTotal,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Sever Error" });
  }
};

exports.emptyCart = async (req, res) => {
  try {
    const cart = await prisma.cart.findFirst({
      where: { orderById: Number(req.user.id) },
    });

    if (!cart) return res.status(400).json({ message: "No cart!!!" });

    await prisma.productOnCart.deleteMany({
      where: { cartId: cart.id },
    });

    const result = await prisma.cart.deleteMany({
      where: { orderById: Number(req.user.id) },
    });

    res.json({
      message: "Cart empty successfully!",
      deletedCount: result.count,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Sever Error" });
  }
};

exports.saveAddress = async (req, res) => {
  try {
    const { address } = req.body;

    await prisma.user.update({
      where: { id: Number(req.user.id) },
      data: { address },
    });

    res.json({ message: "Update address successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Sever Error" });
  }
};

exports.saveOrder = async (req, res) => {
  try {
    const userCart = await prisma.cart.findFirst({
      where: { orderById: Number(req.user.id) },
      include: { products: true },
    });

    if (!userCart || userCart.products.length === 0)
      return res.status(400).json({ message: "Cart is empty!!!" });

    for (const item of userCart.products) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        select: { quantity: true, title: true },
      });

      if (!product || item.count > product.quantity)
        return res
          .status(400)
          .json({ message: `The quantity of goods is insufficient.` });
    }

    const order = await prisma.order.create({
      data: {
        products: {
          create: userCart.products.map((item) => ({
            productId: item.productId,
            count: item.count,
            price: item.price,
          })),
        },
        orderBy: {
          connect: { id: req.user.id },
        },
        cartTotal: userCart.cartTotal,
      },
    });

    // Update Product
    const update = userCart.products.map((item) => ({
      where: { id: item.productId },
      data: {
        quantity: { decrement: item.count },
        sold: { increment: item.count },
      },
    }));

    await Promise.all(update.map((updated) => prisma.product.update(updated)));

    await prisma.cart.deleteMany({
      where: { orderById: Number(req.user.id) },
    });

    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Sever Error" });
  }
};

exports.getOrder = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { orderById: Number(req.user.id) },
      include: {
        products: {
          include: {
            product: true,
          },
        },
      },
    });

    if (orders.length === 0)
      return res.status(400).json({ message: "No orders!!!" });

    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Sever Error" });
  }
};
