# Deployment Guide

Complete guide for deploying FHEVM Universal Template applications.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development](#local-development)
3. [Production Deployment](#production-deployment)
4. [Environment Configuration](#environment-configuration)
5. [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements

- Node.js 18.x or higher
- npm 9.x or higher
- Git

### Required Accounts (for production)

- Ethereum wallet with testnet funds
- RPC provider account (Alchemy, Infura, etc.)
- Etherscan API key (for contract verification)
- Hosting provider account (Vercel, Netlify, etc.)

## Local Development

### 1. Clone and Install

```bash
# Clone repository
git clone <repository-url>
cd fhevm-react-template

# Install all dependencies
npm run install:all
```

### 2. Build SDK

```bash
# Build FHEVM SDK package
npm run build
```

### 3. Start Local Blockchain

```bash
# In terminal 1: Start Hardhat node
cd examples/academic-review
npm run node
```

### 4. Deploy Contracts

```bash
# In terminal 2: Deploy contracts
cd examples/academic-review
npm run deploy:local
```

**Important**: Save the deployed contract address!

### 5. Configure Environment

Update `examples/nextjs-app/.env.local`:

```env
NEXT_PUBLIC_RPC_URL=http://localhost:8545
NEXT_PUBLIC_CONTRACT_ADDRESS=<deployed-contract-address>
NEXT_PUBLIC_CHAIN_ID=31337
```

### 6. Start Next.js App

```bash
# In terminal 3: Start Next.js
cd examples/nextjs-app
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Production Deployment

### Step 1: Deploy Smart Contracts

#### Configure Environment

Create `.env` file:

```env
PRIVATE_KEY=<your-private-key>
SEPOLIA_RPC_URL=<your-rpc-url>
ETHERSCAN_API_KEY=<your-api-key>
```

#### Deploy to Sepolia Testnet

```bash
cd examples/academic-review
npm run deploy:sepolia
```

**Save the contract address from deployment output!**

#### Verify on Etherscan

```bash
npx hardhat verify --network sepolia <contract-address>
```

### Step 2: Deploy Frontend (Vercel)

#### Prepare for Deployment

```bash
cd examples/nextjs-app
npm run build
```

#### Deploy to Vercel

##### Option A: Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```

##### Option B: Using Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your Git repository
4. Configure:
   - Framework: Next.js
   - Root Directory: `examples/nextjs-app`
   - Build Command: `npm run build`
   - Output Directory: `.next`

#### Configure Environment Variables

In Vercel dashboard, add:

```
NEXT_PUBLIC_RPC_URL=<sepolia-rpc-url>
NEXT_PUBLIC_CONTRACT_ADDRESS=<deployed-contract-address>
NEXT_PUBLIC_CHAIN_ID=11155111
```

### Step 3: Deploy Backend/API (if needed)

For Node.js backend:

#### Deploy to Railway

```bash
# Install Railway CLI
npm i -g railway

# Initialize
railway init

# Deploy
railway up
```

#### Deploy to Heroku

```bash
# Install Heroku CLI
npm i -g heroku

# Login
heroku login

# Create app
heroku create your-app-name

# Deploy
git push heroku main
```

## Environment Configuration

### Development (.env.local)

```env
NEXT_PUBLIC_RPC_URL=http://localhost:8545
NEXT_PUBLIC_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
NEXT_PUBLIC_CHAIN_ID=31337
NEXT_PUBLIC_GATEWAY_URL=https://gateway.zama.ai
```

### Staging (.env.staging)

```env
NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_GATEWAY_URL=https://gateway.zama.ai
```

### Production (.env.production)

```env
NEXT_PUBLIC_RPC_URL=https://mainnet.infura.io/v3/YOUR_KEY
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_CHAIN_ID=1
NEXT_PUBLIC_GATEWAY_URL=https://gateway.zama.ai
```

## Deployment Checklist

### Pre-Deployment

- [ ] All tests passing (`npm test`)
- [ ] Build successful (`npm run build`)
- [ ] Environment variables configured
- [ ] Contract deployed and verified
- [ ] RPC endpoints working
- [ ] Wallet funded (for transactions)

### Post-Deployment

- [ ] Frontend accessible
- [ ] Contract interactions working
- [ ] Encryption/decryption functional
- [ ] Error handling tested
- [ ] Performance acceptable
- [ ] Analytics configured (optional)

## Platform-Specific Guides

### Vercel

**next.config.js considerations:**

```javascript
module.exports = {
  webpack: (config) => {
    config.resolve.fallback = {
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
};
```

### Netlify

**netlify.toml:**

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

### AWS Amplify

**amplify.yml:**

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

## Monitoring and Maintenance

### Analytics

Add analytics to track usage:

```javascript
// pages/_app.tsx
import { useEffect } from 'react';
import { useRouter } from 'next/router';

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = (url) => {
      // Track page view
      window.gtag('config', 'GA_MEASUREMENT_ID', {
        page_path: url,
      });
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  return <Component {...pageProps} />;
}
```

### Error Tracking

Use Sentry for error tracking:

```javascript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

### Performance Monitoring

Monitor performance metrics:

```javascript
export function reportWebVitals(metric) {
  console.log(metric);
  // Send to analytics
}
```

## Troubleshooting

### Build Errors

**Issue**: Module not found

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Issue**: Type errors

```bash
# Regenerate types
npm run build
```

### Runtime Errors

**Issue**: Cannot connect to RPC

- Check RPC URL is correct
- Verify API key is valid
- Check rate limits

**Issue**: Contract not found

- Verify contract address
- Check network (mainnet vs testnet)
- Ensure contract is deployed

**Issue**: Transaction fails

- Check wallet has funds
- Verify gas settings
- Check contract function parameters

### Deployment Errors

**Issue**: Vercel build fails

```bash
# Check build logs
vercel logs <deployment-url>

# Test build locally
npm run build
```

**Issue**: Environment variables not working

- Ensure variables start with `NEXT_PUBLIC_` for client-side
- Redeploy after adding variables
- Check variable names match exactly

## Security Considerations

### Environment Variables

- Never commit `.env` files
- Use separate keys for development/production
- Rotate keys regularly
- Use secret management services

### Contract Security

- Audit contracts before mainnet deployment
- Use upgradeable proxy pattern
- Implement access controls
- Add rate limiting

### Frontend Security

- Validate all user inputs
- Sanitize data before display
- Use HTTPS only
- Implement CSP headers

## Scaling Considerations

### Performance Optimization

- Enable caching
- Use CDN for static assets
- Optimize images
- Code splitting

### Infrastructure

- Use load balancers
- Implement auto-scaling
- Set up monitoring
- Configure backups

## Support

For deployment issues:

1. Check [GitHub Issues](https://github.com/your-repo/issues)
2. Review documentation
3. Ask in community forums
4. Contact support team

## Resources

- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- [Vercel Documentation](https://vercel.com/docs)
- [Hardhat Deployment Guide](https://hardhat.org/hardhat-runner/docs/guides/deploying)
- [Etherscan Verification](https://docs.etherscan.io/tutorials/verifying-contracts-programmatically)
