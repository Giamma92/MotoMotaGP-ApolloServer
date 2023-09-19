import { GraphQLError } from 'graphql';
import jwt from 'jsonwebtoken';

export function decodedToken(req, requireAuth = true) {
    const header =  req.headers.authorization || '';
    
    if (header){
        const token = header.replace('Bearer ', '');
        const decoded = jwt.verify(token, 'supersecret');
        return decoded;
    }
    if (requireAuth) {
        // throwing a `GraphQLError` here allows us to specify an HTTP status code,
        // standard `Error`s will have a 500 status code by default
        throw new GraphQLError('User is not authenticated', {
            extensions: {
            code: 'UNAUTHENTICATED',
            http: { status: 401 },
            },
        });
    } 
    return null
}