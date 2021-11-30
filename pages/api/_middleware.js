export async function middleware(req, event) {
    if (req.nextUrl.pathname.includes('instructions')) {
        return new Response('Hello, world!');
    }
}