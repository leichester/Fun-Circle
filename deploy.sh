#!/bin/bash

# Deployment Scripts for Fun Circle

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Fun Circle Deployment ===${NC}\n"

# Function to deploy to production
deploy_prod() {
    echo -e "${YELLOW}Deploying to PRODUCTION (funcircle.net)...${NC}"
    npm run build
    vercel --prod
    echo -e "${GREEN}✅ Production deployment complete!${NC}"
    echo -e "   🌐 Live at: https://funcircle.net"
}

# Function to deploy to testing/preview
deploy_test() {
    echo -e "${YELLOW}Deploying to TESTING environment...${NC}"
    npm run build
    vercel
    echo -e "${GREEN}✅ Testing deployment complete!${NC}"
    echo -e "   🧪 Preview URL will be shown above"
}

# Menu
echo "Select deployment environment:"
echo "1) Production (funcircle.net)"
echo "2) Testing/Preview (vercel.app)"
echo "3) Cancel"
echo ""
read -p "Enter choice [1-3]: " choice

case $choice in
    1)
        deploy_prod
        ;;
    2)
        deploy_test
        ;;
    3)
        echo "Deployment cancelled."
        exit 0
        ;;
    *)
        echo "Invalid choice. Deployment cancelled."
        exit 1
        ;;
esac
