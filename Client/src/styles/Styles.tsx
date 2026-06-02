const customStyles = `
/* Custom Premium Design System */

body {
    background-color: #fcfdfc !important;
}

.product-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 16px 36px rgba(25, 135, 84, 0.15) !important;
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.category-discount-banner {
    animation: fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.header-ribbon {
    position: relative;
    overflow: hidden;
}

.header-ribbon:before, .header-ribbon:after {
    content: '';
    position: absolute;
    bottom: -10px;
    width: 20px;
    height: 20px;
    z-index: -1;
    background: #198754;
    opacity: 0.7;
}

.header-ribbon:before {
    left: -10px;
    border-radius: 0 0 100% 0;
}

.header-ribbon:after {
    right: -10px;
    border-radius: 0 0 0 100%;
}

.category-card:hover {
    transform: translateY(-5px);
    transition: all 0.3s ease;
}

.section-title {
    position: relative;
    display: inline-block;
    padding-bottom: 12px;
    font-weight: 700 !important;
    letter-spacing: -0.5px;
}

.section-title:after {
    content: '';
    position: absolute;
    width: 50px;
    height: 4px;
    background: linear-gradient(90deg, #52c41a, #237804);
    bottom: 0;
    left: 0;
    border-radius: 4px;
    transition: width 0.3s ease;
}

.section-title:hover:after {
    width: 80px;
}

/* Scroll Animations */
@keyframes scroll {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}

.marquee-content {
    animation: scroll 25s linear infinite;
    display: flex;
}

.marquee-content:hover {
    animation-play-state: paused;
}

/* Category Bubble Styles */
.bubble-container {
    display: flex;
    justify-content: flex-start;
    gap: 20px;
    overflow-x: auto;
    padding: 15px 5px;
    scrollbar-width: none; /* Firefox */
}

.bubble-container::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Opera */
}

.category-bubble {
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    min-width: 90px;
}

.category-bubble:hover {
    transform: scale(1.1);
}

.category-bubble-image-wrapper {
    width: 75px;
    height: 75px;
    border-radius: 50%;
    overflow: hidden;
    border: 3px solid transparent;
    transition: all 0.3s ease;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
}

.category-bubble:hover .category-bubble-image-wrapper {
    border-color: #52c41a;
    box-shadow: 0 8px 20px rgba(82, 196, 26, 0.25);
}

.category-bubble.active .category-bubble-image-wrapper {
    border-color: #52c41a;
    box-shadow: 0 8px 20px rgba(82, 196, 26, 0.3);
    background-color: rgba(82, 196, 26, 0.08);
}

.category-bubble-text {
    margin-top: 8px;
    font-size: 13px;
    font-weight: 600;
    color: #434343;
    text-align: center;
    transition: color 0.3s ease;
}

.category-bubble:hover .category-bubble-text,
.category-bubble.active .category-bubble-text {
    color: #52c41a;
}

/* Restaurant Explorer UI Card Styles */
.restaurant-card {
    border-radius: 16px !important;
    overflow: hidden;
    border: 1px solid #f0f0f0 !important;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04) !important;
    transition: all 0.3s ease-in-out !important;
    height: 100%;
}

.restaurant-card:hover {
    transform: translateY(-6px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08) !important;
    border-color: rgba(82, 196, 26, 0.2) !important;
}

.restaurant-card-image {
    transition: transform 0.6s ease !important;
}

.restaurant-card:hover .restaurant-card-image {
    transform: scale(1.06);
}

.restaurant-offer-badge {
    position: absolute;
    bottom: 12px;
    left: 12px;
    background: linear-gradient(135deg, #f5222d 0%, #cf1322 100%);
    color: white;
    padding: 4px 10px;
    font-weight: 700;
    font-size: 11px;
    border-radius: 6px;
    box-shadow: 0 4px 8px rgba(245, 34, 45, 0.3);
    z-index: 2;
    letter-spacing: 0.5px;
}

.restaurant-rating-badge {
    background-color: #389e0d;
    color: white;
    padding: 2px 6px;
    border-radius: 4px;
    font-weight: bold;
    font-size: 12px;
    display: inline-flex;
    align-items: center;
    gap: 4px;
}

.restaurant-rating-badge.rating-low {
    background-color: #d4b106;
}

/* Hero Section */
.hero-search-bar .ant-input-search-button {
    background-color: #52c41a !important;
    border-color: #52c41a !important;
}

.hero-search-bar .ant-input-search-button:hover {
    background-color: #389e0d !important;
    border-color: #389e0d !important;
}

.hero-search-bar .ant-input-affix-wrapper:focus,
.hero-search-bar .ant-input-affix-wrapper-focused {
    border-color: #52c41a !important;
    box-shadow: 0 0 0 2px rgba(82, 196, 26, 0.2) !important;
}

/* Pulse effects */
.pulse-badge {
    animation: pulse 2s infinite;
}

@keyframes pulse {
    0% {
        box-shadow: 0 0 0 0 rgba(82, 196, 26, 0.4);
    }
    70% {
        box-shadow: 0 0 0 10px rgba(82, 196, 26, 0);
    }
    100% {
        box-shadow: 0 0 0 0 rgba(82, 196, 26, 0);
    }
}
`;

export default customStyles;
