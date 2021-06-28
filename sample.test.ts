import { Application } from "https://deno.land/x/oak/mod.ts";

const app = new Application();

// Logger
app.use(async (ctx, next) => {
    console.log("Logger")
    await next();
    console.log("next Logger")
    const rt = ctx.response.headers.get("X-Response-Time");
    console.log(`${ctx.request.method} ${ctx.request.url} - ${rt}`);
});

// Timing
app.use(async (ctx, next) => {
    const start = Date.now();
    console.log("Timer")
    await next();
    console.log("next Timer")
    const ms = Date.now() - start;
    ctx.response.headers.set("X-Response-Time", `${ms}ms`);
});

// Hello World!
app.use((ctx) => {
    console.log("Hello World!")
    ctx.response.body = "Hello World!";
});

await app.listen({ port: 8000 });