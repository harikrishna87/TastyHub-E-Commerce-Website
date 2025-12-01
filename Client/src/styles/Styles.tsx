const customStyles = `
.product-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(25, 135, 84, 0.1) !important;
    transition: all 0.3s ease;
}
.category-discount-banner {
    animation: fadeIn 0.5s ease-in-out;
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
    padding-bottom: 10px;
}
.section-title:after {
    content: '';
    position: absolute;
    width: 60%;
    height: 3px;
    background: #198754;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    border-radius: 2px;
}
.marquee-content {
    animation: scroll 15s linear infinite;
    display: flex;
}
.marquee-content-slow {
    animation: scroll 15s linear infinite;
    display: flex;
}

@keyframes scroll {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
}
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}
`;

export default customStyles;    
