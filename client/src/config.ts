// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = 'gmzboqh658'
export const apiEndpoint = `https://${apiId}.execute-api.us-west-2.amazonaws.com/dev`

export const authConfig = {
  // TODO: Create an Auth0 application and copy values from it into this map
  domain: 'dev-k5n4bfji.us.auth0.com',          // Auth0 domain
  clientId: 'cyfnG0mvrwZBagS0UtqhRffMr7lRiaaT',         // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
