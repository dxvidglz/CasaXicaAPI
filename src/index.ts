import { Hono } from "hono";
import { CloudflareBindings } from "./bindings";
import { ordersApp, productsApp, categoriesApp, usersApp, transactionsApp, webhooksApp } from "./routes";

const app = new Hono<{ Bindings: CloudflareBindings }>();

app.get("/message", (c) => {
  return c.text("Hello Hono!");
});

app.route("/orders", ordersApp);
app.route("/products", productsApp);
app.route("/categories", categoriesApp);
app.route("/transactions", transactionsApp);
app.route("/auth", usersApp);
app.route("/webhooks", webhooksApp);

export default app;
