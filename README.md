# MultiGuard - Multi-Signature Wallet Frontend

A modern, responsive web application for managing multi-signature wallets on Ethereum. Built with React, TypeScript, and Tailwind CSS, featuring a mobile-first design and comprehensive wallet management capabilities.

## 🚀 Live Demo

**[Try MultiGuard Live](https://multi-guard-fe.vercel.app/)**

Experience the full functionality of MultiGuard with our deployed application on Vercel.

## Features

### 🔐 Multi-Signature Security
- Create multi-signature wallets with custom owner configurations
- Set flexible confirmation thresholds (M-of-N signatures)
- Secure transaction approval workflow

### 💼 Wallet Management
- View wallet balances and transaction history
- Manage multiple wallets from a single interface
- Real-time balance updates and transaction status

### 📱 Transaction Operations
- Submit new transactions for approval
- Confirm/approve pending transactions
- Execute fully approved transactions
- Support for both ETH transfers and contract interactions

### 👥 Signer Management
- View all wallet owners and their roles
- Monitor signature requirements and consensus levels
- Track individual confirmation status

### 🎨 Modern UI/UX
- Mobile-first responsive design
- Accessible interface (WCAG compliant)
- Clean, intuitive user experience
- Real-time loading states and error handling

## Technology Stack

- **Frontend**: React 19 with TypeScript
- **Styling**: Tailwind CSS 4.x
- **Web3**: Ethers.js v6, Wagmi, Viem
- **Wallet Connection**: Reown AppKit (formerly Web3Modal)
- **State Management**: TanStack Query (React Query)
- **Routing**: React Router v7
- **Form Handling**: React Hook Form
- **UI Components**: Headless UI
- **Styling Utilities**: Class Variance Authority, Tailwind Merge
- **Date Handling**: Date-fns
- **Build Tool**: Vite
- **Icons**: Heroicons

## Quick Start

### Prerequisites

- Node.js 18+ and pnpm
- A Web3 wallet (MetaMask, WalletConnect compatible)
- Access to an Ethereum network (mainnet, testnet, or local)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd multi-guard-fe
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and configure:
   - `VITE_REOWN_PROJECT_ID`: Get from [Reown Cloud](https://cloud.reown.com)
   - `VITE_APP_URL`: Your application URL (for WalletConnect metadata)
   - `VITE_WALLET_FACTORY_ADDRESS`: Your deployed WalletFactory contract address
   - `VITE_DEFAULT_NETWORK`: (Optional) Default network (e.g., sepolia)

4. **Start development server**
   ```bash
   pnpm dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (Button, Card, etc.)
│   ├── layout/         # Layout components (Header, Sidebar)
│   ├── landing/        # Landing page components
│   └── wallet/         # Wallet-specific components
├── contracts/          # Smart contract ABIs and utilities
│   └── abis/          # Contract ABI files
├── hooks/             # Custom React hooks
├── pages/             # Page components
├── styles/            # Global styles and theme
├── types/             # TypeScript type definitions
└── utils/             # Utility functions
```

## Usage Guide

### 1. Connect Your Wallet
- Click "Connect Wallet" in the header
- Choose your preferred wallet (MetaMask, WalletConnect, etc.)
- Ensure you're on the correct network

### 2. Create a Multi-Sig Wallet
- Navigate to "Create Wallet"
- Add owner addresses (including your own)
- Set the confirmation threshold
- Submit the transaction and wait for confirmation

### 3. Manage Transactions
- **Submit**: Go to "Create Transaction" to propose new transactions
- **Approve**: Use "Pending Transactions" to confirm transactions
- **Execute**: Once threshold is met, execute the transaction

### 4. Monitor Your Wallets
- Dashboard shows all your wallets and recent activity
- View detailed information in "Manage Signers"
- Track transaction history and status

## Smart Contract Integration

This frontend works with two main contracts:

### WalletFactory
- Creates new multi-signature wallets
- Tracks wallets by creator
- Provides wallet discovery functionality

### MultiSigWallet
- Handles transaction submission and execution
- Manages owner confirmations
- Enforces signature thresholds

## Mobile Responsiveness

The application is built with a mobile-first approach:

- **Breakpoints**: Tailwind's responsive system (sm, md, lg, xl)
- **Touch-friendly**: Large tap targets and intuitive gestures
- **Adaptive layouts**: Sidebar collapses to overlay on mobile
- **Optimized performance**: Efficient rendering on mobile devices

## Accessibility Features

- **ARIA labels**: Comprehensive screen reader support
- **Keyboard navigation**: Full keyboard accessibility
- **Color contrast**: WCAG AA compliant color schemes
- **Focus management**: Clear focus indicators
- **Semantic HTML**: Proper heading hierarchy and landmarks

## Security Considerations

- **Input validation**: All user inputs are validated
- **Address verification**: Ethereum address format checking
- **Error handling**: Graceful error states and user feedback
- **No private key storage**: Wallet connection only, no key management

## Development

### Available Scripts

```bash
# Development
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm preview      # Preview production build
pnpm lint         # Run ESLint
```

### Code Quality

- **TypeScript**: Full type safety
- **ESLint**: Code linting and formatting
- **Path aliases**: Configured for clean imports (@/components, @/hooks, etc.)
- **Consistent patterns**: Standardized component structure

## Deployment

### Build for Production

```bash
pnpm build
```

The built files will be in the `dist/` directory.

### Environment Variables

Required for production:
- `VITE_REOWN_PROJECT_ID`: Reown project ID
- `VITE_APP_URL`: Application URL for WalletConnect metadata
- `VITE_WALLET_FACTORY_ADDRESS`: Factory contract address

Optional:
- `VITE_DEFAULT_NETWORK`: Default network configuration

### Hosting Options

- **Vercel**: Zero-config deployment
- **Netlify**: Static site hosting
- **IPFS**: Decentralized hosting
- **Traditional hosting**: Any static file server

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

[MIT License](LICENSE)

## Support

For questions and support:
- Create an issue in the repository
- Check the documentation
- Review the code examples

---

**Note**: This is a frontend interface for multi-signature wallets. Ensure you understand the security implications and test thoroughly before using with real funds.
