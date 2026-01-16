

const landing = await Bun.file("./html/landing.html").text();
const emailMeForm = await Bun.file("./html/email-me-form.html").text();


const port = process.env.PORT || 3000;
const hostname = process.env.PORT ? "0.0.0.0" : "localhost";



function html(str: string) {
    return new Response(str, {
        headers: {
            "Content-Type": "text/html"
        }
    });
}

Bun.serve({
    port,
    hostname,
    routes: {
        "/": html(landing),
        "/search": html(landing.replace("<!--$EMAIL_ME_FORM-->", emailMeForm))
    }
});


console.log(`Serving on http://${hostname}:${port}`);