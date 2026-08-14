export { };

declare global {
    interface CustomJwtSessionClaims {
        metadata: {
            role?: 'admin' | 'seller' | 'buyer';
        };
    }
}
