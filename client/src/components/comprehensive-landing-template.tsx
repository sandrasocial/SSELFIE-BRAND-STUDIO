export const COMPREHENSIVE_LANDING_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{USER_NAME}} - {{USER_TAGLINE}}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #0a0a0a; }
        .serif { font-family: 'Times New Roman', serif; }
        
        /* Navigation */
        .nav { position: fixed; top: 0; left: 0; right: 0; z-index: 1000; background: rgba(255,255,255,0.95); backdrop-filter: blur(10px); border-bottom: 1px solid #e5e5e5; padding: 20px 0; }
        .nav-container { max-width: 1400px; margin: 0 auto; padding: 0 40px; display: flex; justify-content: space-between; align-items: center; }
        .nav-logo { font-family: 'Times New Roman', serif; font-size: 20px; font-weight: 400; letter-spacing: -0.01em; color: #0a0a0a; text-decoration: none; }
        .nav-menu { display: flex; gap: 40px; }
        .nav-item { color: #0a0a0a; text-decoration: none; font-size: 11px; letter-spacing: 0.4em; text-transform: uppercase; transition: opacity 0.3s; }
        .nav-item:hover { opacity: 0.6; }
        
        /* Hero Section */
        .hero-section { 
            height: 100vh; 
            background: linear-gradient(rgba(10,10,10,0.3), rgba(10,10,10,0.3)), url('{{USER_HERO_PHOTO}}') center/cover; 
            display: flex; 
            flex-direction: column;
            justify-content: flex-end; 
            align-items: center;
            text-align: center; 
            color: white; 
            position: relative;
            padding: 80px 40px;
        }
        .hero-content { max-width: 800px; }
        .hero-tagline { 
            font-size: 11px; 
            letter-spacing: 0.4em; 
            text-transform: uppercase; 
            color: rgba(255,255,255,0.7); 
            margin-bottom: 24px; 
        }
        .hero-name-stacked { margin-bottom: 40px; }
        .hero-name-first { 
            font-size: clamp(4rem, 10vw, 9rem); 
            line-height: 1; 
            font-weight: 200; 
            color: white; 
            font-family: 'Times New Roman', serif; 
            letter-spacing: 0.5em; 
            margin-bottom: -10px; 
        }
        .hero-name-last { 
            font-size: clamp(2.5rem, 6vw, 5rem); 
            line-height: 1; 
            font-weight: 200; 
            color: white; 
            font-family: 'Times New Roman', serif; 
            letter-spacing: 0.3em; 
        }
        .cta-minimal { 
            display: inline-block; 
            color: white; 
            text-decoration: none; 
            font-size: 12px; 
            letter-spacing: 0.3em; 
            text-transform: uppercase; 
            font-weight: 300; 
            padding-bottom: 8px; 
            border-bottom: 1px solid rgba(255,255,255,0.3); 
            transition: all 0.3s ease; 
        }
        .cta-minimal:hover { border-bottom-color: white; }
        
        /* About Section */
        .about-section { padding: 120px 40px; background: white; }
        .about-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; max-width: 1200px; margin: 0 auto; align-items: center; }
        .about-content h2 { font-family: 'Times New Roman', serif; font-size: clamp(2.5rem, 5vw, 4rem); font-weight: 300; margin-bottom: 32px; line-height: 1.1; }
        .about-content p { font-size: 18px; line-height: 1.7; margin-bottom: 24px; color: #333; }
        .about-image { background: url('{{USER_ABOUT_PHOTO}}') center/cover; height: 500px; }
        
        /* Power Quote Section */
        .power-quote { min-height: 70vh; display: flex; align-items: center; justify-content: center; background: #0a0a0a; padding: 80px 40px; text-align: center; }
        .power-quote-content { max-width: 900px; }
        .power-quote h2 { font-family: 'Times New Roman', serif; font-size: clamp(2.2rem, 5vw, 4rem); line-height: 1.2; color: white; margin-bottom: 32px; font-weight: 300; letter-spacing: -0.01em; }
        .power-quote-author { font-size: 11px; letter-spacing: 0.4em; text-transform: uppercase; color: rgba(255,255,255,0.6); font-weight: 300; }
        
        /* Editorial Spread Section */
        .editorial-spread { min-height: 80vh; display: grid; grid-template-columns: 1fr 1fr; background: #f5f5f5; }
        .editorial-image { background: url('{{USER_EDITORIAL_PHOTO}}') center/cover; min-height: 400px; }
        .editorial-content { padding: 80px 60px; display: flex; flex-direction: column; justify-content: center; }
        .editorial-eyebrow { font-size: 11px; letter-spacing: 0.4em; text-transform: uppercase; color: #666; margin-bottom: 24px; font-weight: 300; }
        .editorial-headline { font-family: 'Times New Roman', serif; font-size: clamp(2rem, 4vw, 3.5rem); font-weight: 300; line-height: 1.1; margin-bottom: 28px; letter-spacing: -0.01em; }
        .editorial-text { font-size: 16px; line-height: 1.6; color: rgba(10,10,10,0.7); margin-bottom: 20px; }
        .editorial-button { display: inline-block; font-size: 11px; letter-spacing: 0.4em; text-transform: uppercase; color: #0a0a0a; padding-bottom: 2px; border-bottom: 1px solid #e5e5e5; text-decoration: none; transition: border-color 0.3s; margin-top: 16px; }
        .editorial-button:hover { border-color: #0a0a0a; }
        
        /* Services Section */
        .services-section { padding: 120px 40px; background: white; text-align: center; }
        .services-title { font-family: 'Times New Roman', serif; font-size: clamp(2.5rem, 5vw, 4rem); font-weight: 300; margin-bottom: 80px; text-align: center; }
        .services-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 60px; max-width: 1200px; margin: 0 auto; }
        .service-card { text-align: center; }
        .service-icon { width: 120px; height: 120px; background: #f5f5f5; border-radius: 50%; margin: 0 auto 32px; background-size: cover; background-position: center; }
        .service-card h3 { font-family: 'Times New Roman', serif; font-size: 28px; margin-bottom: 20px; font-weight: 300; }
        .service-card p { color: #666; line-height: 1.6; font-size: 16px; }
        .service-price { font-size: 24px; font-weight: 600; color: #0a0a0a; margin-top: 16px; }
        
        /* Portfolio Gallery */
        .portfolio-section { padding: 120px 40px; background: #f5f5f5; }
        .portfolio-title { font-family: 'Times New Roman', serif; font-size: clamp(2.5rem, 5vw, 4rem); font-weight: 300; text-align: center; margin-bottom: 80px; }
        .portfolio-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 40px; max-width: 1000px; margin: 0 auto; }
        .portfolio-item { background-size: cover; background-position: center; height: 500px; transition: transform 0.5s ease; }
        .portfolio-item:hover { transform: scale(1.02); }
        
        /* Testimonial Section */
        .testimonial-section { padding: 120px 40px; background: white; text-align: center; }
        .testimonial-content { max-width: 800px; margin: 0 auto; }
        .testimonial-quote { font-family: 'Times New Roman', serif; font-size: clamp(1.8rem, 4vw, 2.5rem); font-style: italic; font-weight: 300; line-height: 1.3; margin-bottom: 32px; color: #0a0a0a; }
        .testimonial-author { font-size: 16px; color: #666; letter-spacing: 0.1em; }
        
        /* Freebie Signup Section */
        .freebie-section { background: linear-gradient(rgba(10,10,10,0.6), rgba(10,10,10,0.6)), url('{{USER_FREEBIE_BACKGROUND}}') center/cover; color: white; padding: 120px 40px; text-align: center; }
        .freebie-content { max-width: 600px; margin: 0 auto; }
        .freebie-eyebrow { font-size: 11px; letter-spacing: 0.4em; text-transform: uppercase; color: rgba(255,255,255,0.7); margin-bottom: 16px; }
        .freebie-headline { font-family: 'Times New Roman', serif; font-size: clamp(2rem, 4vw, 3rem); font-weight: 300; margin-bottom: 24px; line-height: 1.2; }
        .freebie-text { font-size: 18px; line-height: 1.6; margin-bottom: 40px; color: rgba(255,255,255,0.9); }
        .freebie-form { display: flex; flex-direction: column; gap: 16px; max-width: 400px; margin: 0 auto; }
        .freebie-input { padding: 16px 20px; border: 2px solid rgba(255,255,255,0.3); background: rgba(255,255,255,0.1); color: white; font-size: 16px; }
        .freebie-input::placeholder { color: rgba(255,255,255,0.6); }
        .freebie-button { padding: 16px 20px; background: white; color: #0a0a0a; border: none; font-size: 14px; letter-spacing: 0.1em; text-transform: uppercase; font-weight: 500; cursor: pointer; transition: background 0.3s; }
        .freebie-button:hover { background: #f5f5f5; }
        .freebie-headline { font-family: 'Times New Roman', serif; font-size: clamp(2rem, 4vw, 3rem); font-weight: 300; line-height: 1.2; margin-bottom: 24px; }
        .freebie-text { font-size: 18px; line-height: 1.6; margin-bottom: 40px; color: rgba(255,255,255,0.9); }
        .freebie-form { display: flex; gap: 16px; max-width: 400px; margin: 0 auto; }
        .freebie-input { flex: 1; padding: 16px 20px; border: 1px solid rgba(255,255,255,0.3); background: rgba(255,255,255,0.1); color: white; font-size: 16px; }
        .freebie-input::placeholder { color: rgba(255,255,255,0.7); }
        .freebie-button { padding: 16px 32px; background: white; color: #0a0a0a; border: none; font-size: 11px; letter-spacing: 0.4em; text-transform: uppercase; cursor: pointer; transition: background 0.3s; }
        .freebie-button:hover { background: #f5f5f5; }
        
        /* Footer */
        .footer { padding: 80px 40px 40px; background: #0a0a0a; color: white; }
        .footer-content { max-width: 1200px; margin: 0 auto; text-align: center; }
        .footer-logo { font-family: 'Times New Roman', serif; font-size: 32px; font-weight: 300; margin-bottom: 32px; }
        .footer-links { display: flex; justify-content: center; gap: 40px; margin-bottom: 40px; }
        .footer-link { color: rgba(255,255,255,0.7); text-decoration: none; font-size: 14px; letter-spacing: 0.1em; transition: color 0.3s; }
        .footer-link:hover { color: white; }
        .footer-bottom { padding-top: 40px; border-top: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.5); font-size: 12px; }
        
        /* Responsive */
        @media (max-width: 768px) { 
            .nav-menu { display: none; }
            .about-grid, .editorial-spread { grid-template-columns: 1fr; }
            .services-grid { grid-template-columns: 1fr; gap: 40px; }
            .portfolio-grid { grid-template-columns: 1fr; }
            .freebie-form { flex-direction: column; }
            .footer-links { flex-direction: column; gap: 20px; }
        }
    </style>
</head>
<body>
    <!-- Navigation -->
    <nav class="nav">
        <div class="nav-container">
            <a href="#" class="nav-logo">{{USER_NAME}}</a>
            <div class="nav-menu">
                <a href="#about" class="nav-item">About</a>
                <a href="#services" class="nav-item">Services</a>
                <a href="#portfolio" class="nav-item">Portfolio</a>
                <a href="#contact" class="nav-item">Contact</a>
            </div>
        </div>
    </nav>

    <!-- Hero Section -->
    <section class="hero-section">
        <div class="hero-content">
            <p class="hero-tagline">{{USER_TAGLINE}}</p>
            <div class="hero-name-stacked">
                <h1 class="hero-name-first">{{USER_FIRST_NAME}}</h1>
                <h1 class="hero-name-last">{{USER_LAST_NAME}}</h1>
            </div>
            <a href="#about" class="cta-minimal">About Me</a>
        </div>
    </section>
    
    <!-- About Section -->
    <section id="about" class="about-section">
        <div class="about-grid">
            <div class="about-content">
                <h2>About {{USER_NAME}}</h2>
                <p>{{PERSONAL_STORY}}</p>
                <p>{{PROBLEM_YOU_SOLVE}}</p>
                <p>{{UNIQUE_APPROACH}}</p>
            </div>
            <div class="about-image"></div>
        </div>
    </section>
    
    <!-- Power Quote Section -->
    <section class="power-quote">
        <div class="power-quote-content">
            <h2>"{{POWER_QUOTE_TEXT}}"</h2>
            <p class="power-quote-author">{{USER_NAME}}</p>
        </div>
    </section>
    
    <!-- Editorial Spread -->
    <section class="editorial-spread">
        <div class="editorial-image"></div>
        <div class="editorial-content">
            <p class="editorial-eyebrow">My Approach</p>
            <h2 class="editorial-headline">{{EDITORIAL_HEADLINE}}</h2>
            <p class="editorial-text">{{EDITORIAL_TEXT_1}}</p>
            <p class="editorial-text">{{EDITORIAL_TEXT_2}}</p>
            <a href="#contact" class="editorial-button">Learn More</a>
        </div>
    </section>
    
    <!-- Services Section -->
    <section id="services" class="services-section">
        <h2 class="services-title">How I Can Help</h2>
        <div class="services-grid">
            <div class="service-card">
                <div class="service-icon" style="background-image: url('{{USER_FLATLAY_1}}');"></div>
                <h3>{{SERVICE_1_TITLE}}</h3>
                <p>{{SERVICE_1_DESCRIPTION}}</p>
                <div class="service-price">{{PRIMARY_OFFER_PRICE}}</div>
            </div>
            <div class="service-card">
                <div class="service-icon" style="background-image: url('{{USER_FLATLAY_2}}');"></div>
                <h3>{{SERVICE_2_TITLE}}</h3>
                <p>{{SERVICE_2_DESCRIPTION}}</p>
                <div class="service-price">{{SECONDARY_OFFER_PRICE}}</div>
            </div>
            <div class="service-card">
                <div class="service-icon" style="background-image: url('{{USER_FLATLAY_3}}');"></div>
                <h3>{{SERVICE_3_TITLE}}</h3>
                <p>{{SERVICE_3_DESCRIPTION}}</p>
                <div class="service-price">Custom Pricing</div>
            </div>
        </div>
    </section>
    
    <!-- Portfolio Gallery -->
    <section id="portfolio" class="portfolio-section">
        <h2 class="portfolio-title">Recent Work</h2>
        <div class="portfolio-grid">
            <div class="portfolio-item" style="background-image: url('{{USER_PORTFOLIO_1}}');"></div>
            <div class="portfolio-item" style="background-image: url('{{USER_PORTFOLIO_2}}');"></div>
        </div>
    </section>
    
    <!-- Testimonial Section -->
    <section class="testimonial-section">
        <div class="testimonial-content">
            <blockquote class="testimonial-quote">"{{TESTIMONIAL_TEXT}}"</blockquote>
            <cite class="testimonial-author">{{TESTIMONIAL_AUTHOR}}</cite>
        </div>
    </section>
    
    <!-- Freebie Signup -->
    <section class="freebie-section">
        <div class="freebie-content">
            <p class="freebie-eyebrow">Free Resource</p>
            <h2 class="freebie-headline">{{FREEBIE_TITLE}}</h2>
            <p class="freebie-text">{{FREEBIE_DESCRIPTION}}</p>
            <form class="freebie-form">
                <input type="email" class="freebie-input" placeholder="Your email address" required>
                <button type="submit" class="freebie-button">Get Access</button>
            </form>
        </div>
    </section>
    
    <!-- Footer -->
    <footer id="contact" class="footer">
        <div class="footer-content">
            <h3 class="footer-logo">{{USER_NAME}}</h3>
            <div class="footer-links">
                <a href="mailto:{{CONTACT_EMAIL}}" class="footer-link">{{CONTACT_EMAIL}}</a>
                <a href="https://instagram.com/{{INSTAGRAM_HANDLE}}" class="footer-link">{{INSTAGRAM_HANDLE}}</a>
                <a href="{{WEBSITE_URL}}" class="footer-link">{{WEBSITE_URL}}</a>
            </div>
            <div class="footer-bottom">
                <p>&copy; 2025 {{USER_NAME}}. All rights reserved.</p>
            </div>
        </div>
    </footer>
</body>
</html>`;