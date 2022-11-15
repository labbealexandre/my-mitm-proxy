# MITM Proxy search tool

This repository provides a proxy to search in the requests and the responses bodies for a specific substring. This is one of the feature of the BurpSuite Pro.

## How to install it

This code has been tested with node v18.12.1

I recommend you to use it with nvm.

```bash
nvm install
nvm use

npm i
```

You also need to configure a `.env` file according to the `.env.template` file example.

## How to use it

### Generate CA certificates

```bash
node proxy.js generate
```

You need to configure your browser to use this proxy and trust the given certifcate.

The certificates will be generated in the `certs` folder.

### Search for a substring

```bash
> node proxy.js proxy --search "Finally all the Pokémon data you'll ever need"

Server running on port 8080
[RES]: https://www.google.com/search?q=pokeapi
```

## Disclaimer

You shall not misuse this tool to gain unauthorised access. Performing hack attempts (without permission) on computers that you do not own is illegal.
