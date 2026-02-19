/**
 * NSE/BSE Large Cap & Mid Cap Stock List
 * Includes Nifty 100 (Large Cap) + Nifty Midcap 150 stocks
 * Classified by Market Cap and Sector
 */

const stockList = [
    // ===================================
    // LARGE CAP STOCKS (Nifty 100)
    // ===================================

    // Banking - Large Cap
    { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd', sector: 'Banking', marketCap: 'Large Cap' },
    { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd', sector: 'Banking', marketCap: 'Large Cap' },
    { symbol: 'SBIN', name: 'State Bank of India', sector: 'Banking', marketCap: 'Large Cap' },
    { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank', sector: 'Banking', marketCap: 'Large Cap' },
    { symbol: 'AXISBANK', name: 'Axis Bank Ltd', sector: 'Banking', marketCap: 'Large Cap' },
    { symbol: 'INDUSINDBK', name: 'IndusInd Bank Ltd', sector: 'Banking', marketCap: 'Large Cap' },
    { symbol: 'BANKBARODA', name: 'Bank of Baroda', sector: 'Banking', marketCap: 'Large Cap' },
    { symbol: 'PNB', name: 'Punjab National Bank', sector: 'Banking', marketCap: 'Large Cap' },
    { symbol: 'FEDERALBNK', name: 'Federal Bank Ltd', sector: 'Banking', marketCap: 'Large Cap' },
    { symbol: 'IDFCFIRSTB', name: 'IDFC First Bank Ltd', sector: 'Banking', marketCap: 'Large Cap' },

    // NBFC & Financial Services - Large Cap
    { symbol: 'BAJFINANCE', name: 'Bajaj Finance Ltd', sector: 'NBFC', marketCap: 'Large Cap' },
    { symbol: 'BAJAJFINSV', name: 'Bajaj Finserv Ltd', sector: 'NBFC', marketCap: 'Large Cap' },
    { symbol: 'SHRIRAMFIN', name: 'Shriram Finance Ltd', sector: 'NBFC', marketCap: 'Large Cap' },
    { symbol: 'CHOLAFIN', name: 'Cholamandalam Investment', sector: 'NBFC', marketCap: 'Large Cap' },
    { symbol: 'BAJAJHLDNG', name: 'Bajaj Holdings & Investment', sector: 'NBFC', marketCap: 'Large Cap' },
    { symbol: 'JIOFI', name: 'Jio Financial Services', sector: 'NBFC', marketCap: 'Large Cap' },
    { symbol: 'RECLTD', name: 'REC Ltd', sector: 'NBFC', marketCap: 'Large Cap' },
    { symbol: 'PFC', name: 'Power Finance Corporation', sector: 'NBFC', marketCap: 'Large Cap' },
    { symbol: 'IRFC', name: 'Indian Railway Finance Corp', sector: 'NBFC', marketCap: 'Large Cap' },

    // IT & Technology - Large Cap
    { symbol: 'TCS', name: 'Tata Consultancy Services', sector: 'IT', marketCap: 'Large Cap' },
    { symbol: 'INFY', name: 'Infosys Ltd', sector: 'IT', marketCap: 'Large Cap' },
    { symbol: 'HCLTECH', name: 'HCL Technologies Ltd', sector: 'IT', marketCap: 'Large Cap' },
    { symbol: 'WIPRO', name: 'Wipro Ltd', sector: 'IT', marketCap: 'Large Cap' },
    { symbol: 'TECHM', name: 'Tech Mahindra Ltd', sector: 'IT', marketCap: 'Large Cap' },
    { symbol: 'LTIM', name: 'LTIMindtree Ltd', sector: 'IT', marketCap: 'Large Cap' },

    // Oil & Gas - Large Cap
    { symbol: 'RELIANCE', name: 'Reliance Industries Ltd', sector: 'Oil & Gas', marketCap: 'Large Cap' },
    { symbol: 'ONGC', name: 'Oil & Natural Gas Corp', sector: 'Oil & Gas', marketCap: 'Large Cap' },
    { symbol: 'IOC', name: 'Indian Oil Corporation', sector: 'Oil & Gas', marketCap: 'Large Cap' },
    { symbol: 'BPCL', name: 'Bharat Petroleum Corp', sector: 'Oil & Gas', marketCap: 'Large Cap' },
    { symbol: 'GAIL', name: 'GAIL India Ltd', sector: 'Oil & Gas', marketCap: 'Large Cap' },
    { symbol: 'HINDPETRO', name: 'Hindustan Petroleum', sector: 'Oil & Gas', marketCap: 'Large Cap' },

    // Automobile - Large Cap
    { symbol: 'TATAMOTORS', name: 'Tata Motors Ltd', sector: 'Automobile', marketCap: 'Large Cap' },
    { symbol: 'MARUTI', name: 'Maruti Suzuki India', sector: 'Automobile', marketCap: 'Large Cap' },
    { symbol: 'M&M', name: 'Mahindra & Mahindra', sector: 'Automobile', marketCap: 'Large Cap' },
    { symbol: 'BAJAJ-AUTO', name: 'Bajaj Auto Ltd', sector: 'Automobile', marketCap: 'Large Cap' },
    { symbol: 'HEROMOTOCO', name: 'Hero MotoCorp Ltd', sector: 'Automobile', marketCap: 'Large Cap' },
    { symbol: 'EICHERMOT', name: 'Eicher Motors Ltd', sector: 'Automobile', marketCap: 'Large Cap' },
    { symbol: 'TVSMOTOR', name: 'TVS Motor Company Ltd', sector: 'Automobile', marketCap: 'Large Cap' },
    { symbol: 'HYUNDAI', name: 'Hyundai Motor India', sector: 'Automobile', marketCap: 'Large Cap' },

    // Auto Ancillary - Large Cap
    { symbol: 'MOTHERSON', name: 'Motherson Sumi Wiring', sector: 'Auto Ancillary', marketCap: 'Large Cap' },
    { symbol: 'BOSCHLTD', name: 'Bosch Ltd', sector: 'Auto Ancillary', marketCap: 'Large Cap' },
    { symbol: 'BALKRISIND', name: 'Balkrishna Industries', sector: 'Auto Ancillary', marketCap: 'Large Cap' },
    { symbol: 'MRF', name: 'MRF Ltd', sector: 'Auto Ancillary', marketCap: 'Large Cap' },
    { symbol: 'BHARATFORG', name: 'Bharat Forge Ltd', sector: 'Auto Ancillary', marketCap: 'Large Cap' },

    // Pharma & Healthcare - Large Cap
    { symbol: 'SUNPHARMA', name: 'Sun Pharmaceutical', sector: 'Pharma', marketCap: 'Large Cap' },
    { symbol: 'DRREDDY', name: 'Dr Reddys Laboratories', sector: 'Pharma', marketCap: 'Large Cap' },
    { symbol: 'CIPLA', name: 'Cipla Ltd', sector: 'Pharma', marketCap: 'Large Cap' },
    { symbol: 'DIVISLAB', name: 'Divis Laboratories Ltd', sector: 'Pharma', marketCap: 'Large Cap' },
    { symbol: 'ZYDUSLIFE', name: 'Zydus Lifesciences Ltd', sector: 'Pharma', marketCap: 'Large Cap' },
    { symbol: 'APOLLOHOSP', name: 'Apollo Hospitals', sector: 'Healthcare', marketCap: 'Large Cap' },

    // FMCG - Large Cap
    { symbol: 'HINDUNILVR', name: 'Hindustan Unilever', sector: 'FMCG', marketCap: 'Large Cap' },
    { symbol: 'ITC', name: 'ITC Ltd', sector: 'FMCG', marketCap: 'Large Cap' },
    { symbol: 'NESTLEIND', name: 'Nestle India Ltd', sector: 'FMCG', marketCap: 'Large Cap' },
    { symbol: 'BRITANNIA', name: 'Britannia Industries', sector: 'FMCG', marketCap: 'Large Cap' },
    { symbol: 'DABUR', name: 'Dabur India Ltd', sector: 'FMCG', marketCap: 'Large Cap' },
    { symbol: 'MARICO', name: 'Marico Ltd', sector: 'FMCG', marketCap: 'Large Cap' },
    { symbol: 'GODREJCP', name: 'Godrej Consumer Products', sector: 'FMCG', marketCap: 'Large Cap' },
    { symbol: 'COLPAL', name: 'Colgate-Palmolive India', sector: 'FMCG', marketCap: 'Large Cap' },
    { symbol: 'TATACONSUM', name: 'Tata Consumer Products', sector: 'FMCG', marketCap: 'Large Cap' },
    { symbol: 'VBL', name: 'Varun Beverages Ltd', sector: 'FMCG', marketCap: 'Large Cap' },
    { symbol: 'UNITDSPR', name: 'United Spirits Ltd', sector: 'FMCG', marketCap: 'Large Cap' },

    // Metals & Mining - Large Cap
    { symbol: 'TATASTEEL', name: 'Tata Steel Ltd', sector: 'Metals', marketCap: 'Large Cap' },
    { symbol: 'JSWSTEEL', name: 'JSW Steel Ltd', sector: 'Metals', marketCap: 'Large Cap' },
    { symbol: 'HINDALCO', name: 'Hindalco Industries', sector: 'Metals', marketCap: 'Large Cap' },
    { symbol: 'VEDL', name: 'Vedanta Ltd', sector: 'Metals', marketCap: 'Large Cap' },
    { symbol: 'COALINDIA', name: 'Coal India Ltd', sector: 'Metals', marketCap: 'Large Cap' },
    { symbol: 'JINDALSTEL', name: 'Jindal Steel & Power', sector: 'Metals', marketCap: 'Large Cap' },

    // Power & Utilities - Large Cap
    { symbol: 'POWERGRID', name: 'Power Grid Corp of India', sector: 'Power', marketCap: 'Large Cap' },
    { symbol: 'NTPC', name: 'NTPC Ltd', sector: 'Power', marketCap: 'Large Cap' },
    { symbol: 'ADANIGREEN', name: 'Adani Green Energy', sector: 'Power', marketCap: 'Large Cap' },
    { symbol: 'TATAPOWER', name: 'Tata Power Company', sector: 'Power', marketCap: 'Large Cap' },
    { symbol: 'ADANIPOWER', name: 'Adani Power Ltd', sector: 'Power', marketCap: 'Large Cap' },
    { symbol: 'JSWENERGY', name: 'JSW Energy Ltd', sector: 'Power', marketCap: 'Large Cap' },

    // Infrastructure & Construction - Large Cap
    { symbol: 'LT', name: 'Larsen & Toubro Ltd', sector: 'Infrastructure', marketCap: 'Large Cap' },
    { symbol: 'ADANIENT', name: 'Adani Enterprises Ltd', sector: 'Infrastructure', marketCap: 'Large Cap' },
    { symbol: 'ADANIPORTS', name: 'Adani Ports & SEZ', sector: 'Infrastructure', marketCap: 'Large Cap' },
    { symbol: 'GRASIM', name: 'Grasim Industries Ltd', sector: 'Infrastructure', marketCap: 'Large Cap' },
    { symbol: 'ADANIENERGY', name: 'Adani Energy Solutions', sector: 'Infrastructure', marketCap: 'Large Cap' },

    // Cement - Large Cap
    { symbol: 'ULTRACEMCO', name: 'UltraTech Cement Ltd', sector: 'Cement', marketCap: 'Large Cap' },
    { symbol: 'SHREECEM', name: 'Shree Cement Ltd', sector: 'Cement', marketCap: 'Large Cap' },
    { symbol: 'AMBUJACEM', name: 'Ambuja Cements Ltd', sector: 'Cement', marketCap: 'Large Cap' },

    // Real Estate - Large Cap
    { symbol: 'DLF', name: 'DLF Ltd', sector: 'Real Estate', marketCap: 'Large Cap' },
    { symbol: 'GODREJPROP', name: 'Godrej Properties Ltd', sector: 'Real Estate', marketCap: 'Large Cap' },

    // Telecom - Large Cap
    { symbol: 'BHARTIARTL', name: 'Bharti Airtel Ltd', sector: 'Telecom', marketCap: 'Large Cap' },
    { symbol: 'INDUSTOWER', name: 'Indus Towers Ltd', sector: 'Telecom', marketCap: 'Large Cap' },

    // Consumer Durables - Large Cap
    { symbol: 'TITAN', name: 'Titan Company Ltd', sector: 'Consumer Durables', marketCap: 'Large Cap' },
    { symbol: 'HAVELLS', name: 'Havells India Ltd', sector: 'Consumer Durables', marketCap: 'Large Cap' },
    { symbol: 'TRENT', name: 'Trent Ltd', sector: 'Retail', marketCap: 'Large Cap' },
    { symbol: 'DMART', name: 'Avenue Supermarts Ltd', sector: 'Retail', marketCap: 'Large Cap' },

    // Capital Goods - Large Cap
    { symbol: 'SIEMENS', name: 'Siemens Ltd', sector: 'Capital Goods', marketCap: 'Large Cap' },
    { symbol: 'ABB', name: 'ABB India Ltd', sector: 'Capital Goods', marketCap: 'Large Cap' },
    { symbol: 'HAL', name: 'Hindustan Aeronautics', sector: 'Capital Goods', marketCap: 'Large Cap' },
    { symbol: 'BEL', name: 'Bharat Electronics Ltd', sector: 'Capital Goods', marketCap: 'Large Cap' },
    { symbol: 'CGPOWER', name: 'CG Power & Industrial', sector: 'Capital Goods', marketCap: 'Large Cap' },

    // Chemicals - Large Cap
    { symbol: 'PIDILITIND', name: 'Pidilite Industries', sector: 'Chemicals', marketCap: 'Large Cap' },
    { symbol: 'SRF', name: 'SRF Ltd', sector: 'Chemicals', marketCap: 'Large Cap' },

    // Insurance - Large Cap
    { symbol: 'SBILIFE', name: 'SBI Life Insurance', sector: 'Insurance', marketCap: 'Large Cap' },
    { symbol: 'HDFCLIFE', name: 'HDFC Life Insurance', sector: 'Insurance', marketCap: 'Large Cap' },
    { symbol: 'ICICIPRULI', name: 'ICICI Prudential Life', sector: 'Insurance', marketCap: 'Large Cap' },
    { symbol: 'ICICIGI', name: 'ICICI Lombard General', sector: 'Insurance', marketCap: 'Large Cap' },
    { symbol: 'LICI', name: 'Life Insurance Corp', sector: 'Insurance', marketCap: 'Large Cap' },

    // Others - Large Cap
    { symbol: 'ASIANPAINT', name: 'Asian Paints Ltd', sector: 'Paints', marketCap: 'Large Cap' },
    { symbol: 'INDIGO', name: 'InterGlobe Aviation', sector: 'Aviation', marketCap: 'Large Cap' },
    { symbol: 'SBICARD', name: 'SBI Cards & Payment', sector: 'Financial Services', marketCap: 'Large Cap' },

    // ===================================
    // MID CAP STOCKS (Nifty Midcap 150)
    // ===================================

    // Banking - Mid Cap
    { symbol: 'CANBK', name: 'Canara Bank', sector: 'Banking', marketCap: 'Mid Cap' },
    { symbol: 'UNIONBANK', name: 'Union Bank of India', sector: 'Banking', marketCap: 'Mid Cap' },
    { symbol: 'INDIANB', name: 'Indian Bank', sector: 'Banking', marketCap: 'Mid Cap' },
    { symbol: 'IDBI', name: 'IDBI Bank Ltd', sector: 'Banking', marketCap: 'Mid Cap' },
    { symbol: 'RBLBANK', name: 'RBL Bank Ltd', sector: 'Banking', marketCap: 'Mid Cap' },
    { symbol: 'CUB', name: 'City Union Bank', sector: 'Banking', marketCap: 'Mid Cap' },
    { symbol: 'KARURVYSYA', name: 'Karur Vysya Bank', sector: 'Banking', marketCap: 'Mid Cap' },
    { symbol: 'BANDHANBNK', name: 'Bandhan Bank Ltd', sector: 'Banking', marketCap: 'Mid Cap' },
    { symbol: 'AUBANK', name: 'AU Small Finance Bank', sector: 'Banking', marketCap: 'Mid Cap' },

    // NBFC - Mid Cap
    { symbol: 'MUTHOOTFIN', name: 'Muthoot Finance Ltd', sector: 'NBFC', marketCap: 'Mid Cap' },
    { symbol: 'MANAPPURAM', name: 'Manappuram Finance', sector: 'NBFC', marketCap: 'Mid Cap' },
    { symbol: 'POONAWALLA', name: 'Poonawalla Fincorp', sector: 'NBFC', marketCap: 'Mid Cap' },
    { symbol: 'IIFL', name: 'IIFL Finance Ltd', sector: 'NBFC', marketCap: 'Mid Cap' },
    { symbol: 'ABCAPITAL', name: 'Aditya Birla Capital', sector: 'NBFC', marketCap: 'Mid Cap' },
    { symbol: 'HDFCAMC', name: 'HDFC Asset Management', sector: 'NBFC', marketCap: 'Mid Cap' },
    { symbol: 'BAJAJHFL', name: 'Bajaj Housing Finance', sector: 'NBFC', marketCap: 'Mid Cap' },
    { symbol: 'LICHSGFIN', name: 'LIC Housing Finance', sector: 'NBFC', marketCap: 'Mid Cap' },
    { symbol: 'CANFINHOME', name: 'Can Fin Homes Ltd', sector: 'NBFC', marketCap: 'Mid Cap' },

    // IT - Mid Cap
    { symbol: 'COFORGE', name: 'Coforge Ltd', sector: 'IT', marketCap: 'Mid Cap' },
    { symbol: 'MPHASIS', name: 'Mphasis Ltd', sector: 'IT', marketCap: 'Mid Cap' },
    { symbol: 'PERSISTENT', name: 'Persistent Systems Ltd', sector: 'IT', marketCap: 'Mid Cap' },
    { symbol: 'LTTS', name: 'L&T Technology Services', sector: 'IT', marketCap: 'Mid Cap' },
    { symbol: 'TATAELXSI', name: 'Tata Elxsi Ltd', sector: 'IT', marketCap: 'Mid Cap' },
    { symbol: 'CYIENT', name: 'Cyient Ltd', sector: 'IT', marketCap: 'Mid Cap' },
    { symbol: 'BIRLASOFT', name: 'Birlasoft Ltd', sector: 'IT', marketCap: 'Mid Cap' },
    { symbol: 'DATAPATTNS', name: 'Data Patterns India', sector: 'IT', marketCap: 'Mid Cap' },
    { symbol: 'SYRMA', name: 'Syrma SGS Technology', sector: 'IT', marketCap: 'Mid Cap' },

    // Pharma - Mid Cap
    { symbol: 'LUPIN', name: 'Lupin Ltd', sector: 'Pharma', marketCap: 'Mid Cap' },
    { symbol: 'AUROPHARMA', name: 'Aurobindo Pharma Ltd', sector: 'Pharma', marketCap: 'Mid Cap' },
    { symbol: 'BIOCON', name: 'Biocon Ltd', sector: 'Pharma', marketCap: 'Mid Cap' },
    { symbol: 'TORNTPHARM', name: 'Torrent Pharmaceuticals', sector: 'Pharma', marketCap: 'Mid Cap' },
    { symbol: 'ALKEM', name: 'Alkem Laboratories Ltd', sector: 'Pharma', marketCap: 'Mid Cap' },
    { symbol: 'IPCALAB', name: 'IPCA Laboratories Ltd', sector: 'Pharma', marketCap: 'Mid Cap' },
    { symbol: 'LAURUSLABS', name: 'Laurus Labs Ltd', sector: 'Pharma', marketCap: 'Mid Cap' },
    { symbol: 'GLENMARK', name: 'Glenmark Pharma Ltd', sector: 'Pharma', marketCap: 'Mid Cap' },
    { symbol: 'NATCOPHARM', name: 'Natco Pharma Ltd', sector: 'Pharma', marketCap: 'Mid Cap' },
    { symbol: 'MAXHEALTH', name: 'Max Healthcare', sector: 'Healthcare', marketCap: 'Mid Cap' },

    // Automobile - Mid Cap
    { symbol: 'ASHOKLEY', name: 'Ashok Leyland Ltd', sector: 'Automobile', marketCap: 'Mid Cap' },
    { symbol: 'FORCEMOT', name: 'Force Motors Ltd', sector: 'Automobile', marketCap: 'Mid Cap' },
    { symbol: 'ESCORTS', name: 'Escorts Kubota Ltd', sector: 'Automobile', marketCap: 'Mid Cap' },
    { symbol: 'SONACOMS', name: 'Sona BLW Precision', sector: 'Automobile', marketCap: 'Mid Cap' },
    { symbol: 'TIINDIA', name: 'Tube Investments India', sector: 'Automobile', marketCap: 'Mid Cap' },

    // Auto Ancillary - Mid Cap
    { symbol: 'APOLLOTYRE', name: 'Apollo Tyres Ltd', sector: 'Auto Ancillary', marketCap: 'Mid Cap' },
    { symbol: 'CEAT', name: 'CEAT Ltd', sector: 'Auto Ancillary', marketCap: 'Mid Cap' },
    { symbol: 'JKTYRE', name: 'JK Tyre & Industries', sector: 'Auto Ancillary', marketCap: 'Mid Cap' },
    { symbol: 'EXIDEIND', name: 'Exide Industries Ltd', sector: 'Auto Ancillary', marketCap: 'Mid Cap' },
    { symbol: 'AMARARAJA', name: 'Amara Raja Energy', sector: 'Auto Ancillary', marketCap: 'Mid Cap' },
    { symbol: 'CRAFTSMAN', name: 'Craftsman Automation', sector: 'Auto Ancillary', marketCap: 'Mid Cap' },
    { symbol: 'SUNDRMFAST', name: 'Sundram Fasteners Ltd', sector: 'Auto Ancillary', marketCap: 'Mid Cap' },

    // Metals & Mining - Mid Cap
    { symbol: 'NMDC', name: 'NMDC Ltd', sector: 'Metals', marketCap: 'Mid Cap' },
    { symbol: 'SAIL', name: 'Steel Authority of India', sector: 'Metals', marketCap: 'Mid Cap' },
    { symbol: 'NATIONALUM', name: 'National Aluminium Co', sector: 'Metals', marketCap: 'Mid Cap' },
    { symbol: 'MOIL', name: 'MOIL Ltd', sector: 'Metals', marketCap: 'Mid Cap' },
    { symbol: 'HINDZINC', name: 'Hindustan Zinc Ltd', sector: 'Metals', marketCap: 'Mid Cap' },
    { symbol: 'RATNAMANI', name: 'Ratnamani Metals', sector: 'Metals', marketCap: 'Mid Cap' },

    // Power & Utilities - Mid Cap
    { symbol: 'NHPC', name: 'NHPC Ltd', sector: 'Power', marketCap: 'Mid Cap' },
    { symbol: 'TORNTPOWER', name: 'Torrent Power Ltd', sector: 'Power', marketCap: 'Mid Cap' },
    { symbol: 'CESC', name: 'CESC Ltd', sector: 'Power', marketCap: 'Mid Cap' },
    { symbol: 'SJVN', name: 'SJVN Ltd', sector: 'Power', marketCap: 'Mid Cap' },
    { symbol: 'NLCINDIA', name: 'NLC India Ltd', sector: 'Power', marketCap: 'Mid Cap' },
    { symbol: 'POWERMECH', name: 'Power Mech Projects', sector: 'Power', marketCap: 'Mid Cap' },
    { symbol: 'WAAREE', name: 'Waaree Energies', sector: 'Power', marketCap: 'Mid Cap' },
    { symbol: 'ADANITOTAL', name: 'Adani Total Gas', sector: 'Power', marketCap: 'Mid Cap' },

    // Infrastructure & Construction - Mid Cap
    { symbol: 'OBEROIRLTY', name: 'Oberoi Realty Ltd', sector: 'Real Estate', marketCap: 'Mid Cap' },
    { symbol: 'PRESTIGE', name: 'Prestige Estates Projects', sector: 'Real Estate', marketCap: 'Mid Cap' },
    { symbol: 'LODHA', name: 'Macrotech Developers', sector: 'Real Estate', marketCap: 'Mid Cap' },
    { symbol: 'BRIGADE', name: 'Brigade Enterprises', sector: 'Real Estate', marketCap: 'Mid Cap' },
    { symbol: 'PHOENIXLTD', name: 'Phoenix Mills Ltd', sector: 'Real Estate', marketCap: 'Mid Cap' },
    { symbol: 'GMRINFRA', name: 'GMR Airports Infra', sector: 'Infrastructure', marketCap: 'Mid Cap' },
    { symbol: 'IRB', name: 'IRB Infrastructure', sector: 'Infrastructure', marketCap: 'Mid Cap' },
    { symbol: 'NBCC', name: 'NBCC India Ltd', sector: 'Infrastructure', marketCap: 'Mid Cap' },

    // Cement - Mid Cap
    { symbol: 'ACC', name: 'ACC Ltd', sector: 'Cement', marketCap: 'Mid Cap' },
    { symbol: 'RAMCOCEM', name: 'Ramco Cements Ltd', sector: 'Cement', marketCap: 'Mid Cap' },
    { symbol: 'JKCEMENT', name: 'JK Cement Ltd', sector: 'Cement', marketCap: 'Mid Cap' },
    { symbol: 'DALBHARAT', name: 'Dalmia Bharat Ltd', sector: 'Cement', marketCap: 'Mid Cap' },
    { symbol: 'BIRLACORPN', name: 'Birla Corporation Ltd', sector: 'Cement', marketCap: 'Mid Cap' },

    // Telecom - Mid Cap
    { symbol: 'IDEA', name: 'Vodafone Idea Ltd', sector: 'Telecom', marketCap: 'Mid Cap' },
    { symbol: 'BSOFT', name: 'Birlasoft Ltd', sector: 'Telecom', marketCap: 'Mid Cap' },

    // Consumer Durables - Mid Cap
    { symbol: 'VOLTAS', name: 'Voltas Ltd', sector: 'Consumer Durables', marketCap: 'Mid Cap' },
    { symbol: 'BLUESTARCO', name: 'Blue Star Ltd', sector: 'Consumer Durables', marketCap: 'Mid Cap' },
    { symbol: 'CROMPTON', name: 'Crompton Greaves Consumer', sector: 'Consumer Durables', marketCap: 'Mid Cap' },
    { symbol: 'PAGEIND', name: 'Page Industries Ltd', sector: 'Consumer Durables', marketCap: 'Mid Cap' },
    { symbol: 'WHIRLPOOL', name: 'Whirlpool of India', sector: 'Consumer Durables', marketCap: 'Mid Cap' },
    { symbol: 'ORIENTELEC', name: 'Orient Electric Ltd', sector: 'Consumer Durables', marketCap: 'Mid Cap' },
    { symbol: 'VGUARD', name: 'V-Guard Industries', sector: 'Consumer Durables', marketCap: 'Mid Cap' },
    { symbol: 'BATAINDIA', name: 'Bata India Ltd', sector: 'Consumer Durables', marketCap: 'Mid Cap' },
    { symbol: 'RELAXO', name: 'Relaxo Footwears Ltd', sector: 'Consumer Durables', marketCap: 'Mid Cap' },

    // Capital Goods - Mid Cap
    { symbol: 'BHEL', name: 'Bharat Heavy Electricals', sector: 'Capital Goods', marketCap: 'Mid Cap' },
    { symbol: 'CUMMINSIND', name: 'Cummins India Ltd', sector: 'Capital Goods', marketCap: 'Mid Cap' },
    { symbol: 'THERMAX', name: 'Thermax Ltd', sector: 'Capital Goods', marketCap: 'Mid Cap' },
    { symbol: 'KIRLOSENG', name: 'Kirloskar Oil Engines', sector: 'Capital Goods', marketCap: 'Mid Cap' },
    { symbol: 'HITACHI', name: 'Hitachi Energy India', sector: 'Capital Goods', marketCap: 'Mid Cap' },
    { symbol: 'GEVERNOVA', name: 'GE Vernova T&D', sector: 'Capital Goods', marketCap: 'Mid Cap' },
    { symbol: 'POLYCAB', name: 'Polycab India Ltd', sector: 'Capital Goods', marketCap: 'Mid Cap' },
    { symbol: 'KEI', name: 'KEI Industries Ltd', sector: 'Capital Goods', marketCap: 'Mid Cap' },
    { symbol: 'AIAENG', name: 'AIA Engineering Ltd', sector: 'Capital Goods', marketCap: 'Mid Cap' },
    { symbol: 'KAYNES', name: 'Kaynes Technology', sector: 'Capital Goods', marketCap: 'Mid Cap' },
    { symbol: 'DIXON', name: 'Dixon Technologies', sector: 'Capital Goods', marketCap: 'Mid Cap' },

    // Chemicals - Mid Cap
    { symbol: 'ATUL', name: 'Atul Ltd', sector: 'Chemicals', marketCap: 'Mid Cap' },
    { symbol: 'DEEPAKNTR', name: 'Deepak Nitrite Ltd', sector: 'Chemicals', marketCap: 'Mid Cap' },
    { symbol: 'NAVINFLUOR', name: 'Navin Fluorine', sector: 'Chemicals', marketCap: 'Mid Cap' },
    { symbol: 'UPL', name: 'UPL Ltd', sector: 'Chemicals', marketCap: 'Mid Cap' },
    { symbol: 'AARTIIND', name: 'Aarti Industries Ltd', sector: 'Chemicals', marketCap: 'Mid Cap' },
    { symbol: 'FINEORG', name: 'Fine Organic Industries', sector: 'Chemicals', marketCap: 'Mid Cap' },
    { symbol: 'ANUPAM', name: 'Anupam Rasayan India', sector: 'Chemicals', marketCap: 'Mid Cap' },
    { symbol: 'CLEAN', name: 'Clean Science & Tech', sector: 'Chemicals', marketCap: 'Mid Cap' },
    { symbol: 'SUMICHEM', name: 'Sumitomo Chemical India', sector: 'Chemicals', marketCap: 'Mid Cap' },

    // Paints - Mid Cap
    { symbol: 'BERGEPAINT', name: 'Berger Paints India', sector: 'Paints', marketCap: 'Mid Cap' },
    { symbol: 'KANSAINER', name: 'Kansai Nerolac Paints', sector: 'Paints', marketCap: 'Mid Cap' },
    { symbol: 'AKZOINDIA', name: 'Akzo Nobel India Ltd', sector: 'Paints', marketCap: 'Mid Cap' },

    // Retail & E-Commerce - Mid Cap
    { symbol: 'ZOMATO', name: 'Zomato Ltd', sector: 'Internet', marketCap: 'Mid Cap' },
    { symbol: 'NYKAA', name: 'FSN E-Commerce Ventures', sector: 'E-Commerce', marketCap: 'Mid Cap' },
    { symbol: 'DELHIVERY', name: 'Delhivery Ltd', sector: 'Logistics', marketCap: 'Mid Cap' },
    { symbol: 'CARTRADE', name: 'CarTrade Tech Ltd', sector: 'E-Commerce', marketCap: 'Mid Cap' },

    // Fintech - Mid Cap
    { symbol: 'PAYTM', name: 'One97 Communications', sector: 'Fintech', marketCap: 'Mid Cap' },
    { symbol: 'POLICYBZR', name: 'PB Fintech Ltd', sector: 'Fintech', marketCap: 'Mid Cap' },
    { symbol: 'ANGELONE', name: 'Angel One Ltd', sector: 'Fintech', marketCap: 'Mid Cap' },
    { symbol: 'BSE', name: 'BSE Ltd', sector: 'Financial Services', marketCap: 'Mid Cap' },
    { symbol: 'CDSL', name: 'CDSL Ltd', sector: 'Financial Services', marketCap: 'Mid Cap' },

    // Travel & Hospitality - Mid Cap
    { symbol: 'IRCTC', name: 'IRCTC Ltd', sector: 'Travel', marketCap: 'Mid Cap' },
    { symbol: 'INDHOTEL', name: 'Indian Hotels Company', sector: 'Hospitality', marketCap: 'Mid Cap' },
    { symbol: 'LEMON', name: 'Lemon Tree Hotels', sector: 'Hospitality', marketCap: 'Mid Cap' },
    { symbol: 'THOMASCOOK', name: 'Thomas Cook India', sector: 'Travel', marketCap: 'Mid Cap' },

    // Media & Entertainment - Mid Cap
    { symbol: 'PVRINOX', name: 'PVR INOX Ltd', sector: 'Media', marketCap: 'Mid Cap' },
    { symbol: 'ZEEL', name: 'Zee Entertainment', sector: 'Media', marketCap: 'Mid Cap' },
    { symbol: 'SUNTV', name: 'Sun TV Network Ltd', sector: 'Media', marketCap: 'Mid Cap' },

    // Oil & Gas - Mid Cap
    { symbol: 'MRPL', name: 'Mangalore Refinery', sector: 'Oil & Gas', marketCap: 'Mid Cap' },
    { symbol: 'PETRONET', name: 'Petronet LNG Ltd', sector: 'Oil & Gas', marketCap: 'Mid Cap' },
    { symbol: 'GESHIP', name: 'Great Eastern Shipping', sector: 'Shipping', marketCap: 'Mid Cap' },
    { symbol: 'OIL', name: 'Oil India Ltd', sector: 'Oil & Gas', marketCap: 'Mid Cap' },

    // Textiles - Mid Cap
    { symbol: 'TATAELXSI', name: 'Tata Elxsi Ltd', sector: 'IT', marketCap: 'Mid Cap' },
    { symbol: 'RAYMOND', name: 'Raymond Ltd', sector: 'Textiles', marketCap: 'Mid Cap' },
    { symbol: 'ARVIND', name: 'Arvind Ltd', sector: 'Textiles', marketCap: 'Mid Cap' },
    { symbol: 'KPRMILL', name: 'KPR Mill Ltd', sector: 'Textiles', marketCap: 'Mid Cap' },

    // Miscellaneous - Mid Cap
    { symbol: 'TVSHLDNG', name: 'TVS Holdings Ltd', sector: 'Holdings', marketCap: 'Mid Cap' },
    { symbol: 'MOTHERSON', name: 'Samvardhana Motherson', sector: 'Auto Ancillary', marketCap: 'Mid Cap' },
    { symbol: 'AFFLE', name: 'Affle India Ltd', sector: 'IT', marketCap: 'Mid Cap' },
    { symbol: 'ROUTE', name: 'Route Mobile Ltd', sector: 'IT', marketCap: 'Mid Cap' },
    { symbol: 'ANANDRATHI', name: 'Anand Rathi Wealth', sector: 'Financial Services', marketCap: 'Mid Cap' },
    { symbol: 'CHOICEIN', name: 'Choice International', sector: 'Financial Services', marketCap: 'Mid Cap' },
    { symbol: 'ASAHIGLASS', name: 'Asahi India Glass', sector: 'Consumer Durables', marketCap: 'Mid Cap' },
];

// Sector indices for correlation analysis
const sectorIndices = {
    'Banking': '^NSEBANK',
    'IT': '^CNXIT',
    'Pharma': '^CNXPHARMA',
    'FMCG': '^CNXFMCG',
    'Metals': '^CNXMETAL',
    'Auto': '^CNXAUTO',
    'Realty': '^CNXREALTY',
    'Energy': '^CNXENERGY'
};

// Get all unique sectors
const getSectors = () => {
    return [...new Set(stockList.map(s => s.sector))];
};

// Get stocks by sector
const getStocksBySector = (sector) => {
    return stockList.filter(s => s.sector === sector);
};

// Get stocks by market cap
const getStocksByMarketCap = (marketCap) => {
    return stockList.filter(s => s.marketCap === marketCap);
};

// Get stock info by symbol
const getStockInfo = (symbol) => {
    return stockList.find(s => s.symbol === symbol);
};

// Get all large cap stocks
const getLargeCapStocks = () => {
    return stockList.filter(s => s.marketCap === 'Large Cap');
};

// Get all mid cap stocks
const getMidCapStocks = () => {
    return stockList.filter(s => s.marketCap === 'Mid Cap');
};

module.exports = {
    stockList,
    sectorIndices,
    getSectors,
    getStocksBySector,
    getStocksByMarketCap,
    getStockInfo,
    getLargeCapStocks,
    getMidCapStocks
};
