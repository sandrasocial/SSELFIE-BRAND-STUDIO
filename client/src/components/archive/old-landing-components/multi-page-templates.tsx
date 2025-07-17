// Multi-page website templates using Sandra's design system
// Each page uses the same hero structure but different content

// SINGLE PAGE TEMPLATE - All sections combined with smooth navigation
export const SINGLE_PAGE_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{USER_NAME}} - {{USER_TAGLINE}}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        /* FIX FOR ANCHOR NAVIGATION - ALL NAVIGATION MUST USE ANCHORS INSTEAD OF ROUTES */
        body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #0a0a0a; }
        
        /* Navigation */
        .nav { position: fixed; top: 0; left: 0; right: 0; z-index: 1000; background: rgba(255,255,255,0.95); backdrop-filter: blur(10px); border-bottom: 1px solid #e5e5e5; padding: 20px 0; }
        .nav-container { max-width: 1400px; margin: 0 auto; padding: 0 40px; display: flex; justify-content: space-between; align-items: center; }
        .nav-logo { font-family: 'Times New Roman', serif; font-size: 20px; font-weight: 400; letter-spacing: -0.01em; color: #0a0a0a; text-decoration: none; }
        .nav-menu { display: flex; gap: 40px; }
        .nav-item { color: #0a0a0a; text-decoration: none; font-size: 11px; letter-spacing: 0.4em; text-transform: uppercase; transition: opacity 0.3s; }
        .nav-item:hover { opacity: 0.6; }
        
        /* Hero Section */
        .hero-section { height: 100vh; background: linear-gradient(rgba(10,10,10,0.3), rgba(10,10,10,0.3)), url('{{USER_HERO_PHOTO}}') center top/cover; display: flex; flex-direction: column; justify-content: flex-end; align-items: center; text-align: center; color: white; position: relative; padding: 80px 40px; }
        .hero-content { max-width: 800px; }
        .hero-tagline { font-size: 11px; letter-spacing: 0.4em; text-transform: uppercase; color: rgba(255,255,255,0.7); margin-bottom: 24px; }
        .hero-name-stacked { margin-bottom: 40px; }
        .hero-name-first { font-size: clamp(4rem, 10vw, 9rem); line-height: 1; font-weight: 200; color: white; font-family: 'Times New Roman', serif; letter-spacing: 0.5em; margin-bottom: -10px; }
        .hero-name-last { font-size: clamp(2.5rem, 6vw, 5rem); line-height: 1; font-weight: 200; color: white; font-family: 'Times New Roman', serif; letter-spacing: 0.3em; }
        .cta-minimal { display: inline-block; color: white; text-decoration: none; font-size: 12px; letter-spacing: 0.3em; text-transform: uppercase; font-weight: 300; padding-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.3); transition: all 0.3s ease; }
        .cta-minimal:hover { border-bottom-color: white; }
        
        /* About Section */
        .about-section { padding: 120px 40px; background: white; }
        .about-grid { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; }
        .about-content h2 { font-family: 'Times New Roman', serif; font-size: clamp(2.5rem, 5vw, 4rem); font-weight: 300; margin-bottom: 40px; line-height: 1.2; }
        .about-content p { font-size: 18px; line-height: 1.7; color: #333; margin-bottom: 24px; }
        .about-image { background: url('{{USER_ABOUT_PHOTO}}') center top/cover; height: 600px; }
        
        /* Services Section */
        .services-section { padding: 120px 40px; background: #f5f5f5; }
        .services-content { max-width: 1200px; margin: 0 auto; }
        .services-title { font-family: 'Times New Roman', serif; font-size: clamp(2.5rem, 5vw, 4rem); font-weight: 300; margin-bottom: 80px; text-align: center; }
        .services-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 60px; }
        .service-card { background: white; padding: 60px 40px; text-align: center; }
        .service-card h3 { font-family: 'Times New Roman', serif; font-size: 28px; margin-bottom: 24px; font-weight: 300; }
        .service-card p { color: #666; line-height: 1.6; margin-bottom: 24px; }
        .service-price { font-size: 24px; font-weight: 600; color: #0a0a0a; margin: 20px 0; }
        .service-button { display: inline-block; background: #0a0a0a; color: white; padding: 16px 32px; text-decoration: none; font-size: 11px; letter-spacing: 0.4em; text-transform: uppercase; transition: background 0.3s; }
        .service-button:hover { background: #333; }
        
        /* Contact Section */
        .contact-section { padding: 120px 40px; background: white; text-align: center; }
        .contact-content { max-width: 800px; margin: 0 auto; }
        .contact-title { font-family: 'Times New Roman', serif; font-size: clamp(2.5rem, 5vw, 4rem); font-weight: 300; margin-bottom: 40px; }
        .contact-text { font-size: 18px; line-height: 1.7; color: #333; margin-bottom: 40px; }
        .contact-info { display: flex; justify-content: center; gap: 60px; flex-wrap: wrap; }
        .contact-item p { margin: 8px 0; }
        .contact-item strong { display: block; margin-bottom: 8px; font-family: 'Times New Roman', serif; font-size: 18px; }
        
        /* Footer */
        .footer { background: #0a0a0a; color: rgba(255,255,255,0.7); padding: 60px 40px 40px; text-align: center; }
        .footer-copyright { font-size: 11px; letter-spacing: 0.4em; text-transform: uppercase; opacity: 0.5; }
        
        /* Responsive */
        @media (max-width: 768px) {
            .nav-menu { display: none; }
            .hero-section { padding: 60px 20px; }
            .about-grid { grid-template-columns: 1fr; gap: 40px; }
            .services-grid { grid-template-columns: 1fr; }
            .contact-info { flex-direction: column; gap: 30px; }
        }
    </style>
</head>
<body>
    <!-- Navigation -->
    <nav class="nav">
        <div class="nav-container">
            <a href="#home" class="nav-logo">{{USER_FIRST_NAME}}</a>
            <div class="nav-menu">
                <a href="#home" class="nav-item">HOME</a>
                <a href="#about" class="nav-item">ABOUT</a>
                <a href="#services" class="nav-item">SERVICES</a>
                <a href="#contact" class="nav-item">CONTACT</a>
            </div>
        </div>
    </nav>

    <!-- Hero Section -->
    <section id="home" class="hero-section">
        <div class="hero-content">
            <p class="hero-tagline">{{USER_TAGLINE}}</p>
            <div class="hero-name-stacked">
                <h1 class="hero-name-first">{{USER_FIRST_NAME}}</h1>
                <h1 class="hero-name-last">{{USER_LAST_NAME}}</h1>
            </div>
            <a href="#about" class="cta-minimal">Start Your Journey</a>
        </div>
    </section>

    <!-- About Section -->
    <section id="about" class="about-section">
        <div class="about-grid">
            <div class="about-content">
                <h2>{{PERSONAL_STORY}}</h2>
                <p>{{EDITORIAL_TEXT_1}}</p>
                <p>{{EDITORIAL_TEXT_2}}</p>
            </div>
            <div class="about-image"></div>
        </div>
    </section>

    <!-- Services Section -->
    <section id="services" class="services-section">
        <div class="services-content">
            <h2 class="services-title">How I Can Help</h2>
            <div class="services-grid">
                <div class="service-card">
                    <h3>{{SERVICE_1_TITLE}}</h3>
                    <p>{{SERVICE_1_DESCRIPTION}}</p>
                    <div class="service-price">{{PRIMARY_OFFER_PRICE}}</div>
                    <a href="mailto:{{CONTACT_EMAIL}}" class="service-button">Get Started</a>
                </div>
                <div class="service-card">
                    <h3>{{SERVICE_2_TITLE}}</h3>
                    <p>{{SERVICE_2_DESCRIPTION}}</p>
                    <div class="service-price">Starting at $197</div>
                    <a href="mailto:{{CONTACT_EMAIL}}" class="service-button">Learn More</a>
                </div>
                <div class="service-card">
                    <h3>{{SERVICE_3_TITLE}}</h3>
                    <p>{{SERVICE_3_DESCRIPTION}}</p>
                    <div class="service-price">Custom Pricing</div>
                    <a href="mailto:{{CONTACT_EMAIL}}" class="service-button">Book Call</a>
                </div>
            </div>
        </div>
    </section>

    <!-- Contact Section -->
    <section id="contact" class="contact-section">
        <div class="contact-content">
            <h2 class="contact-title">Let's Work Together</h2>
            <p class="contact-text">Ready to transform your business? I'd love to hear about your vision and see how we can bring it to life.</p>
            <div class="contact-info">
                <div class="contact-item">
                    <strong>Email</strong>
                    <p><a href="mailto:{{CONTACT_EMAIL}}" style="color: #0a0a0a; text-decoration: none;">{{CONTACT_EMAIL}}</a></p>
                </div>
                <div class="contact-item">
                    <strong>Instagram</strong>
                    <p><a href="https://instagram.com/{{INSTAGRAM_HANDLE}}" style="color: #0a0a0a; text-decoration: none;" target="_blank">{{INSTAGRAM_HANDLE}}</a></p>
                </div>
                <div class="contact-item">
                    <strong>Website</strong>
                    <p><a href="{{WEBSITE_URL}}" style="color: #0a0a0a; text-decoration: none;" target="_blank">{{WEBSITE_URL}}</a></p>
                </div>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
        <div class="footer-copyright">
            © 2025 {{USER_FIRST_NAME}} {{USER_LAST_NAME}}. All rights reserved.
        </div>
    </footer>
</body>
</html>`;

export const MULTI_PAGE_HOME_TEMPLATE = `<!DOCTYPE html>
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
        .nav-item.active { opacity: 1; border-bottom: 1px solid #0a0a0a; }
        
        /* Hero Section - EXACT SAME STYLING */
        .hero-section { 
            height: 100vh; 
            background: linear-gradient(rgba(10,10,10,0.3), rgba(10,10,10,0.3)), url('{{USER_HERO_PHOTO}}') center top/cover; 
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
        .about-image { background: url('{{USER_ABOUT_PHOTO}}') center top/cover; height: 500px; }
        
        /* Power Quote Section */
        .power-quote { min-height: 70vh; display: flex; align-items: center; justify-content: center; background: #0a0a0a; padding: 80px 40px; text-align: center; }
        .power-quote-content { max-width: 900px; }
        .power-quote h2 { font-family: 'Times New Roman', serif; font-size: clamp(2.2rem, 5vw, 4rem); line-height: 1.2; color: white; margin-bottom: 32px; font-weight: 300; letter-spacing: -0.01em; }
        .power-quote-author { font-size: 11px; letter-spacing: 0.4em; text-transform: uppercase; color: rgba(255,255,255,0.6); font-weight: 300; }
        
        /* Editorial Spread Section */
        .editorial-spread { min-height: 80vh; display: grid; grid-template-columns: 1fr 1fr; background: #f5f5f5; }
        .editorial-image { background: url('{{USER_EDITORIAL_PHOTO}}') center top/cover; min-height: 400px; }
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
        .portfolio-item { background-size: cover; background-position: center top; height: 500px; transition: transform 0.5s ease; }
        .portfolio-item:hover { transform: scale(1.02); }
        
        /* Testimonial Section */
        .testimonial-section { padding: 120px 40px; background: white; text-align: center; }
        .testimonial-content { max-width: 800px; margin: 0 auto; }
        .testimonial-quote { font-family: 'Times New Roman', serif; font-size: clamp(1.8rem, 4vw, 2.5rem); font-style: italic; font-weight: 300; line-height: 1.3; margin-bottom: 32px; color: #0a0a0a; }
        .testimonial-author { font-size: 16px; color: #666; letter-spacing: 0.1em; }
        
        /* Freebie Signup Section */
        .freebie-section { background: linear-gradient(rgba(10,10,10,0.6), rgba(10,10,10,0.6)), url('{{USER_FREEBIE_BACKGROUND}}') center top/cover; color: white; padding: 120px 40px; text-align: center; }
        .freebie-content { max-width: 600px; margin: 0 auto; }
        .freebie-eyebrow { font-size: 11px; letter-spacing: 0.4em; text-transform: uppercase; color: rgba(255,255,255,0.7); margin-bottom: 16px; }
        .freebie-headline { font-family: 'Times New Roman', serif; font-size: clamp(2rem, 4vw, 3rem); font-weight: 300; margin-bottom: 24px; line-height: 1.2; }
        .freebie-text { font-size: 18px; line-height: 1.6; margin-bottom: 40px; color: rgba(255,255,255,0.9); }
        .freebie-form { display: flex; flex-direction: column; gap: 16px; max-width: 400px; margin: 0 auto; }
        .freebie-input { padding: 16px; border: none; font-size: 16px; color: #0a0a0a; }
        .freebie-button { background: white; color: #0a0a0a; padding: 16px 32px; border: none; cursor: pointer; font-size: 11px; letter-spacing: 0.4em; text-transform: uppercase; transition: background 0.3s; }
        .freebie-button:hover { background: #f0f0f0; }
        
        /* Footer */
        .footer { background: #0a0a0a; color: rgba(255,255,255,0.7); padding: 80px 40px 40px; text-align: center; }
        .footer-content { max-width: 600px; margin: 0 auto; }
        .footer-links { display: flex; justify-content: center; gap: 40px; margin-bottom: 40px; flex-wrap: wrap; }
        .footer-link { color: rgba(255,255,255,0.7); text-decoration: none; font-size: 11px; letter-spacing: 0.4em; text-transform: uppercase; transition: color 0.3s; }
        .footer-link:hover { color: white; }
        .footer-copyright { font-size: 11px; letter-spacing: 0.4em; text-transform: uppercase; opacity: 0.5; }
        
        /* Responsive */
        @media (max-width: 768px) {
            .nav-container { padding: 0 20px; }
            .nav-menu { display: none; }
            .hero-section { padding: 60px 20px; }
            .about-grid { grid-template-columns: 1fr; gap: 40px; }
            .editorial-spread { grid-template-columns: 1fr; }
            .editorial-content { padding: 40px 30px; }
            .services-grid { grid-template-columns: 1fr; }
            .portfolio-grid { grid-template-columns: 1fr; }
            .footer-links { flex-direction: column; gap: 20px; }
        }
    </style>
</head>
<body>
    <!-- Navigation -->
    <nav class="nav">
        <div class="nav-container">
            <a href="#" class="nav-logo">{{USER_FIRST_NAME}}</a>
            <div class="nav-menu">
                <a href="#home" class="nav-item">HOME</a>
                <a href="#about" class="nav-item">ABOUT</a>
                <a href="#services" class="nav-item">SERVICES</a>
                <a href="#contact" class="nav-item">CONTACT</a>
            </div>
        </div>
    </nav>

    <!-- Hero Section -->
    <section id="home" class="hero-section">
        <div class="hero-content">
            <p class="hero-tagline">{{USER_TAGLINE}}</p>
            <div class="hero-name-stacked">
                <h1 class="hero-name-first">{{USER_FIRST_NAME}}</h1>
                <h1 class="hero-name-last">{{USER_LAST_NAME}}</h1>
            </div>
            <a href="#about" class="cta-minimal">Start Your Journey</a>
        </div>
    </section>

    <!-- About Section -->
    <section id="about" class="about-section">
        <div class="about-grid">
            <div class="about-content">
                <h2>{{PERSONAL_STORY}}</h2>
                <p>{{EDITORIAL_TEXT_1}}</p>
                <p>{{EDITORIAL_TEXT_2}}</p>
            </div>
            <div class="about-image"></div>
        </div>
    </section>

    <!-- Power Quote Section -->
    <section class="power-quote">
        <div class="power-quote-content">
            <h2>{{POWER_QUOTE_TEXT}}</h2>
            <p class="power-quote-author">{{USER_FIRST_NAME}} {{USER_LAST_NAME}}</p>
        </div>
    </section>

    <!-- Editorial Spread Section -->
    <section class="editorial-spread">
        <div class="editorial-image"></div>
        <div class="editorial-content">
            <p class="editorial-eyebrow">The Difference</p>
            <h2 class="editorial-headline">{{EDITORIAL_HEADLINE}}</h2>
            <p class="editorial-text">{{EDITORIAL_TEXT_1}}</p>
            <p class="editorial-text">{{EDITORIAL_TEXT_2}}</p>
            <a href="#services" class="editorial-button">Explore Services</a>
        </div>
    </section>

    <!-- Services Preview -->
    <section class="services-section">
        <h2 class="services-title">How I Can Help</h2>
        <div class="services-grid">
            <div class="service-card">
                <div class="service-icon" style="background-image: url('{{USER_SERVICE_PHOTO_1}}');"></div>
                <h3>{{SERVICE_1_TITLE}}</h3>
                <p>{{SERVICE_1_DESCRIPTION}}</p>
                <div class="service-price">{{PRIMARY_OFFER_PRICE}}</div>
            </div>
            <div class="service-card">
                <div class="service-icon" style="background-image: url('{{USER_SERVICE_PHOTO_2}}');"></div>
                <h3>{{SERVICE_2_TITLE}}</h3>
                <p>{{SERVICE_2_DESCRIPTION}}</p>
                <div class="service-price">{{SECONDARY_OFFER_PRICE}}</div>
            </div>
            <div class="service-card">
                <div class="service-icon" style="background-image: url('{{USER_SERVICE_PHOTO_3}}');"></div>
                <h3>{{SERVICE_3_TITLE}}</h3>
                <p>{{SERVICE_3_DESCRIPTION}}</p>
                <div class="service-price">Investment varies</div>
            </div>
        </div>
    </section>

    <!-- Portfolio Gallery -->
    <section class="portfolio-section">
        <h2 class="portfolio-title">Recent Work</h2>
        <div class="portfolio-grid">
            <div class="portfolio-item" style="background-image: url('{{USER_PORTFOLIO_PHOTO_1}}');"></div>
            <div class="portfolio-item" style="background-image: url('{{USER_PORTFOLIO_PHOTO_2}}');"></div>
            <div class="portfolio-item" style="background-image: url('{{USER_PORTFOLIO_PHOTO_3}}');"></div>
            <div class="portfolio-item" style="background-image: url('{{USER_PORTFOLIO_PHOTO_4}}');"></div>
        </div>
    </section>

    <!-- Testimonial Section -->
    <section class="testimonial-section">
        <div class="testimonial-content">
            <p class="testimonial-quote">"{{TESTIMONIAL_TEXT}}"</p>
            <p class="testimonial-author">{{TESTIMONIAL_AUTHOR}}</p>
        </div>
    </section>

    <!-- Freebie Signup Section -->
    <section class="freebie-section">
        <div class="freebie-content">
            <p class="freebie-eyebrow">Free Resource</p>
            <h2 class="freebie-headline">{{FREEBIE_TITLE}}</h2>
            <p class="freebie-text">{{FREEBIE_DESCRIPTION}}</p>
            <form class="freebie-form">
                <input type="email" placeholder="YOUR EMAIL ADDRESS" class="freebie-input" required>
                <button type="submit" class="freebie-button">Download Now</button>
            </form>
        </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
        <div class="footer-content">
            <div class="footer-links">
                <a href="mailto:{{CONTACT_EMAIL}}" class="footer-link">Email</a>
                <a href="https://instagram.com/{{INSTAGRAM_HANDLE}}" class="footer-link">Instagram</a>
                <a href="{{WEBSITE_URL}}" class="footer-link">Website</a>
            </div>
            <p class="footer-copyright">© 2025 {{USER_NAME}}. All rights reserved.</p>
        </div>
    </footer>
</body>
</html>`;

export const MULTI_PAGE_ABOUT_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>About - {{USER_NAME}}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #0a0a0a; }
        
        /* Navigation - Same as Home */
        .nav { position: fixed; top: 0; left: 0; right: 0; z-index: 1000; background: rgba(255,255,255,0.95); backdrop-filter: blur(10px); border-bottom: 1px solid #e5e5e5; padding: 20px 0; }
        .nav-container { max-width: 1400px; margin: 0 auto; padding: 0 40px; display: flex; justify-content: space-between; align-items: center; }
        .nav-logo { font-family: 'Times New Roman', serif; font-size: 20px; font-weight: 400; letter-spacing: -0.01em; color: #0a0a0a; text-decoration: none; }
        .nav-menu { display: flex; gap: 40px; }
        .nav-item { color: #0a0a0a; text-decoration: none; font-size: 11px; letter-spacing: 0.4em; text-transform: uppercase; transition: opacity 0.3s; }
        .nav-item:hover { opacity: 0.6; }
        .nav-item.active { opacity: 1; border-bottom: 1px solid #0a0a0a; }
        
        /* Hero Section - SAME DESIGN, DIFFERENT TITLE */
        .hero-section { 
            height: 100vh; 
            background: linear-gradient(rgba(10,10,10,0.3), rgba(10,10,10,0.3)), url('{{USER_HERO_PHOTO}}') center top/cover; 
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
        .hero-tagline { font-size: 11px; letter-spacing: 0.4em; text-transform: uppercase; color: rgba(255,255,255,0.7); margin-bottom: 24px; }
        .hero-title { 
            font-size: clamp(4rem, 10vw, 9rem); 
            line-height: 1; 
            font-weight: 200; 
            color: white; 
            font-family: 'Times New Roman', serif; 
            letter-spacing: 0.5em; 
            margin-bottom: 40px; 
        }
        
        /* About Content Sections */
        .about-story { padding: 120px 40px; background: white; }
        .about-story-content { max-width: 1000px; margin: 0 auto; }
        .about-story h2 { font-family: 'Times New Roman', serif; font-size: clamp(2.5rem, 5vw, 4rem); font-weight: 300; margin-bottom: 40px; text-align: center; }
        .about-story-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; margin-top: 80px; }
        .about-text { font-size: 18px; line-height: 1.7; color: #333; }
        .about-text p { margin-bottom: 24px; }
        .about-image { background: url('{{USER_ABOUT_PHOTO}}') center top/cover; height: 600px; }
        
        .values-section { padding: 120px 40px; background: #f5f5f5; }
        .values-content { max-width: 1200px; margin: 0 auto; text-align: center; }
        .values-title { font-family: 'Times New Roman', serif; font-size: clamp(2.5rem, 5vw, 4rem); font-weight: 300; margin-bottom: 80px; }
        .values-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 60px; }
        .value-item { text-align: center; }
        .value-item h3 { font-family: 'Times New Roman', serif; font-size: 28px; margin-bottom: 20px; font-weight: 300; }
        .value-item p { color: #666; line-height: 1.6; font-size: 16px; }
        
        /* Experience Section */
        .experience-section { padding: 120px 40px; background: white; }
        .experience-content { max-width: 1000px; margin: 0 auto; }
        .experience-title { font-family: 'Times New Roman', serif; font-size: clamp(2.5rem, 5vw, 4rem); font-weight: 300; margin-bottom: 80px; text-align: center; }
        .timeline { position: relative; }
        .timeline-item { margin-bottom: 60px; padding-left: 60px; position: relative; }
        .timeline-item::before { content: ''; position: absolute; left: 20px; top: 10px; width: 12px; height: 12px; background: #0a0a0a; border-radius: 50%; }
        .timeline-item::after { content: ''; position: absolute; left: 25px; top: 22px; width: 2px; height: calc(100% + 40px); background: #e5e5e5; }
        .timeline-item:last-child::after { display: none; }
        .timeline-year { font-size: 14px; letter-spacing: 0.4em; text-transform: uppercase; color: #666; margin-bottom: 8px; }
        .timeline-title { font-family: 'Times New Roman', serif; font-size: 24px; margin-bottom: 12px; font-weight: 300; }
        .timeline-description { color: #666; line-height: 1.6; }
        
        /* CTA Section */
        .cta-section { background: linear-gradient(rgba(10,10,10,0.6), rgba(10,10,10,0.6)), url('{{USER_CTA_BACKGROUND}}') center top/cover; color: white; padding: 120px 40px; text-align: center; }
        .cta-content { max-width: 600px; margin: 0 auto; }
        .cta-headline { font-family: 'Times New Roman', serif; font-size: clamp(2rem, 4vw, 3rem); font-weight: 300; margin-bottom: 24px; line-height: 1.2; }
        .cta-text { font-size: 18px; line-height: 1.6; margin-bottom: 40px; color: rgba(255,255,255,0.9); }
        .cta-button { display: inline-block; background: white; color: #0a0a0a; padding: 16px 32px; text-decoration: none; font-size: 11px; letter-spacing: 0.4em; text-transform: uppercase; transition: background 0.3s; }
        .cta-button:hover { background: #f0f0f0; }
        
        /* Footer - Same as Home */
        .footer { background: #0a0a0a; color: rgba(255,255,255,0.7); padding: 80px 40px 40px; text-align: center; }
        .footer-content { max-width: 600px; margin: 0 auto; }
        .footer-links { display: flex; justify-content: center; gap: 40px; margin-bottom: 40px; flex-wrap: wrap; }
        .footer-link { color: rgba(255,255,255,0.7); text-decoration: none; font-size: 11px; letter-spacing: 0.4em; text-transform: uppercase; transition: color 0.3s; }
        .footer-link:hover { color: white; }
        .footer-copyright { font-size: 11px; letter-spacing: 0.4em; text-transform: uppercase; opacity: 0.5; }
        
        /* Responsive */
        @media (max-width: 768px) {
            .nav-container { padding: 0 20px; }
            .nav-menu { display: none; }
            .hero-section { padding: 60px 20px; }
            .about-story-grid { grid-template-columns: 1fr; gap: 40px; }
            .values-grid { grid-template-columns: 1fr; }
            .timeline-item { padding-left: 40px; }
        }
    </style>
</head>
<body>
    <!-- Navigation -->
    <nav class="nav">
        <div class="nav-container">
            <a href="/" class="nav-logo">{{USER_FIRST_NAME}}</a>
            <div class="nav-menu">
                <a href="#home" class="nav-item">HOME</a>
                <a href="#about" class="nav-item active">ABOUT</a>
                <a href="#services" class="nav-item">SERVICES</a>
                <a href="#contact" class="nav-item">CONTACT</a>
            </div>
        </div>
    </nav>

    <!-- Hero Section - Same design, different title -->
    <section class="hero-section">
        <div class="hero-content">
            <p class="hero-tagline">{{USER_TAGLINE}}</p>
            <h1 class="hero-title">ABOUT</h1>
        </div>
    </section>

    <!-- About Story Section -->
    <section class="about-story">
        <div class="about-story-content">
            <h2>My Story</h2>
            <div class="about-story-grid">
                <div class="about-text">
                    <p>{{PERSONAL_STORY}}</p>
                    <p>{{EDITORIAL_TEXT_1}}</p>
                    <p>{{EDITORIAL_TEXT_2}}</p>
                    <p>{{UNIQUE_APPROACH}}</p>
                </div>
                <div class="about-image"></div>
            </div>
        </div>
    </section>

    <!-- Values Section -->
    <section class="values-section">
        <div class="values-content">
            <h2 class="values-title">What I Believe</h2>
            <div class="values-grid">
                <div class="value-item">
                    <h3>Authenticity</h3>
                    <p>Your story is what sets you apart from everyone else doing "the same thing." Authenticity isn't a strategy—it's your superpower.</p>
                </div>
                <div class="value-item">
                    <h3>Strategic Clarity</h3>
                    <p>No templates, no copying what everyone else is doing. This is about building something that's unmistakably yours.</p>
                </div>
                <div class="value-item">
                    <h3>Transformation</h3>
                    <p>{{PROBLEM_YOU_SOLVE}} Your business deserves strategy that's as unique as you are.</p>
                </div>
            </div>
        </div>
    </section>

    <!-- Experience Timeline -->
    <section class="experience-section">
        <div class="experience-content">
            <h2 class="experience-title">My Journey</h2>
            <div class="timeline">
                <div class="timeline-item">
                    <div class="timeline-year">2019</div>
                    <h3 class="timeline-title">The Beginning</h3>
                    <p class="timeline-description">Started my journey understanding that every successful business begins with a clear, authentic story.</p>
                </div>
                <div class="timeline-item">
                    <div class="timeline-year">2021</div>
                    <h3 class="timeline-title">Finding My Method</h3>
                    <p class="timeline-description">Developed my unique approach to {{UNIQUE_APPROACH}} and discovered what really makes brands connect.</p>
                </div>
                <div class="timeline-item">
                    <div class="timeline-year">2023</div>
                    <h3 class="timeline-title">Proven Results</h3>
                    <p class="timeline-description">Helped hundreds of {{TARGET_CLIENT}} transform their businesses and discover their authentic voice.</p>
                </div>
                <div class="timeline-item">
                    <div class="timeline-year">2025</div>
                    <h3 class="timeline-title">Today</h3>
                    <p class="timeline-description">Continuing to help ambitious professionals build businesses that reflect who they really are.</p>
                </div>
            </div>
        </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section">
        <div class="cta-content">
            <h2 class="cta-headline">Ready to start your story?</h2>
            <p class="cta-text">Stop guessing and start growing. Let's discover what makes your business unmistakably yours.</p>
            <a href="#contact" class="cta-button">Let's Work Together</a>
        </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
        <div class="footer-content">
            <div class="footer-links">
                <a href="mailto:{{CONTACT_EMAIL}}" class="footer-link">Email</a>
                <a href="https://instagram.com/{{INSTAGRAM_HANDLE}}" class="footer-link">Instagram</a>
                <a href="{{WEBSITE_URL}}" class="footer-link">Website</a>
            </div>
            <p class="footer-copyright">© 2025 {{USER_NAME}}. All rights reserved.</p>
        </div>
    </footer>
</body>
</html>`;

// Continue with SERVICES and CONTACT templates...
export const MULTI_PAGE_SERVICES_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Services - {{USER_NAME}}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #0a0a0a; }
        
        /* Navigation - Same as other pages */
        .nav { position: fixed; top: 0; left: 0; right: 0; z-index: 1000; background: rgba(255,255,255,0.95); backdrop-filter: blur(10px); border-bottom: 1px solid #e5e5e5; padding: 20px 0; }
        .nav-container { max-width: 1400px; margin: 0 auto; padding: 0 40px; display: flex; justify-content: space-between; align-items: center; }
        .nav-logo { font-family: 'Times New Roman', serif; font-size: 20px; font-weight: 400; letter-spacing: -0.01em; color: #0a0a0a; text-decoration: none; }
        .nav-menu { display: flex; gap: 40px; }
        .nav-item { color: #0a0a0a; text-decoration: none; font-size: 11px; letter-spacing: 0.4em; text-transform: uppercase; transition: opacity 0.3s; }
        .nav-item:hover { opacity: 0.6; }
        .nav-item.active { opacity: 1; border-bottom: 1px solid #0a0a0a; }
        
        /* Hero Section - SAME DESIGN, "SERVICES" TITLE */
        .hero-section { 
            height: 100vh; 
            background: linear-gradient(rgba(10,10,10,0.3), rgba(10,10,10,0.3)), url('{{USER_HERO_PHOTO}}') center top/cover; 
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
        .hero-tagline { font-size: 11px; letter-spacing: 0.4em; text-transform: uppercase; color: rgba(255,255,255,0.7); margin-bottom: 24px; }
        .hero-title { 
            font-size: clamp(4rem, 10vw, 9rem); 
            line-height: 1; 
            font-weight: 200; 
            color: white; 
            font-family: 'Times New Roman', serif; 
            letter-spacing: 0.5em; 
            margin-bottom: 40px; 
        }
        
        /* Services Content */
        .services-intro { padding: 120px 40px; background: white; text-align: center; }
        .services-intro-content { max-width: 800px; margin: 0 auto; }
        .services-intro h2 { font-family: 'Times New Roman', serif; font-size: clamp(2.5rem, 5vw, 4rem); font-weight: 300; margin-bottom: 40px; }
        .services-intro p { font-size: 18px; line-height: 1.7; color: #333; }
        
        .services-detailed { padding: 120px 40px; background: #f5f5f5; }
        .services-detailed-content { max-width: 1200px; margin: 0 auto; }
        .service-detailed { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; margin-bottom: 120px; }
        .service-detailed:nth-child(even) { direction: rtl; }
        .service-detailed:nth-child(even) > * { direction: ltr; }
        .service-text h3 { font-family: 'Times New Roman', serif; font-size: clamp(2rem, 4vw, 3rem); font-weight: 300; margin-bottom: 24px; }
        .service-text p { font-size: 16px; line-height: 1.6; color: #666; margin-bottom: 20px; }
        .service-price { font-size: 24px; font-weight: 600; color: #0a0a0a; margin: 20px 0; }
        .service-features { list-style: none; margin: 24px 0; }
        .service-features li { padding: 8px 0; color: #666; position: relative; padding-left: 20px; }
        .service-features li::before { content: '·'; position: absolute; left: 0; font-weight: bold; }
        .service-button { display: inline-block; background: #0a0a0a; color: white; padding: 16px 32px; text-decoration: none; font-size: 11px; letter-spacing: 0.4em; text-transform: uppercase; transition: background 0.3s; margin-top: 20px; }
        .service-button:hover { background: #333; }
        .service-image { background-size: cover; background-position: center top; height: 500px; }
        
        /* Process Section */
        .process-section { padding: 120px 40px; background: white; }
        .process-content { max-width: 1000px; margin: 0 auto; text-align: center; }
        .process-title { font-family: 'Times New Roman', serif; font-size: clamp(2.5rem, 5vw, 4rem); font-weight: 300; margin-bottom: 80px; }
        .process-steps { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 60px; }
        .process-step { text-align: center; }
        .step-number { font-size: 48px; font-weight: 200; color: #e5e5e5; margin-bottom: 20px; font-family: 'Times New Roman', serif; }
        .step-title { font-family: 'Times New Roman', serif; font-size: 24px; margin-bottom: 16px; font-weight: 300; }
        .step-description { color: #666; line-height: 1.6; }
        
        /* FAQ Section */
        .faq-section { padding: 120px 40px; background: #f5f5f5; }
        .faq-content { max-width: 800px; margin: 0 auto; }
        .faq-title { font-family: 'Times New Roman', serif; font-size: clamp(2.5rem, 5vw, 4rem); font-weight: 300; margin-bottom: 80px; text-align: center; }
        .faq-item { margin-bottom: 40px; }
        .faq-question { font-family: 'Times New Roman', serif; font-size: 20px; margin-bottom: 12px; font-weight: 300; }
        .faq-answer { color: #666; line-height: 1.6; }
        
        /* CTA Section */
        .cta-section { background: linear-gradient(rgba(10,10,10,0.6), rgba(10,10,10,0.6)), url('{{USER_CTA_BACKGROUND}}') center top/cover; color: white; padding: 120px 40px; text-align: center; }
        .cta-content { max-width: 600px; margin: 0 auto; }
        .cta-headline { font-family: 'Times New Roman', serif; font-size: clamp(2rem, 4vw, 3rem); font-weight: 300; margin-bottom: 24px; line-height: 1.2; }
        .cta-text { font-size: 18px; line-height: 1.6; margin-bottom: 40px; color: rgba(255,255,255,0.9); }
        .cta-button { display: inline-block; background: white; color: #0a0a0a; padding: 16px 32px; text-decoration: none; font-size: 11px; letter-spacing: 0.4em; text-transform: uppercase; transition: background 0.3s; }
        .cta-button:hover { background: #f0f0f0; }
        
        /* Footer */
        .footer { background: #0a0a0a; color: rgba(255,255,255,0.7); padding: 80px 40px 40px; text-align: center; }
        .footer-content { max-width: 600px; margin: 0 auto; }
        .footer-links { display: flex; justify-content: center; gap: 40px; margin-bottom: 40px; flex-wrap: wrap; }
        .footer-link { color: rgba(255,255,255,0.7); text-decoration: none; font-size: 11px; letter-spacing: 0.4em; text-transform: uppercase; transition: color 0.3s; }
        .footer-link:hover { color: white; }
        .footer-copyright { font-size: 11px; letter-spacing: 0.4em; text-transform: uppercase; opacity: 0.5; }
        
        /* Responsive */
        @media (max-width: 768px) {
            .nav-container { padding: 0 20px; }
            .nav-menu { display: none; }
            .hero-section { padding: 60px 20px; }
            .service-detailed { grid-template-columns: 1fr; gap: 40px; }
            .process-steps { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <!-- Navigation -->
    <nav class="nav">
        <div class="nav-container">
            <a href="/" class="nav-logo">{{USER_FIRST_NAME}}</a>
            <div class="nav-menu">
                <a href="#home" class="nav-item">HOME</a>
                <a href="#about" class="nav-item">ABOUT</a>
                <a href="#services" class="nav-item">SERVICES</a>
                <a href="#contact" class="nav-item">CONTACT</a>
            </div>
        </div>
    </nav>

    <!-- Hero Section -->
    <section class="hero-section">
        <div class="hero-content">
            <p class="hero-tagline">{{USER_TAGLINE}}</p>
            <h1 class="hero-title">SERVICES</h1>
        </div>
    </section>

    <!-- Services Introduction -->
    <section class="services-intro">
        <div class="services-intro-content">
            <h2>How I Can Help</h2>
            <p>{{EDITORIAL_TEXT_1}} {{EDITORIAL_TEXT_2}} Your business deserves strategy that's as unique as you are.</p>
        </div>
    </section>

    <!-- Detailed Services -->
    <section class="services-detailed">
        <div class="services-detailed-content">
            <!-- Service 1 -->
            <div class="service-detailed">
                <div class="service-text">
                    <h3>{{SERVICE_1_TITLE}}</h3>
                    <p>{{SERVICE_1_DESCRIPTION}}</p>
                    <div class="service-price">{{PRIMARY_OFFER_PRICE}}</div>
                    <ul class="service-features">
                        <li>Comprehensive strategy session</li>
                        <li>Custom brand messaging framework</li>
                        <li>Target audience analysis</li>
                        <li>Implementation roadmap</li>
                        <li>90-day follow-up support</li>
                    </ul>
                    <a href="#contact" class="service-button">Get Started</a>
                </div>
                <div class="service-image" style="background-image: url('{{USER_SERVICE_PHOTO_1}}');"></div>
            </div>

            <!-- Service 2 -->
            <div class="service-detailed">
                <div class="service-text">
                    <h3>{{SERVICE_2_TITLE}}</h3>
                    <p>{{SERVICE_2_DESCRIPTION}}</p>
                    <div class="service-price">{{SECONDARY_OFFER_PRICE}}</div>
                    <ul class="service-features">
                        <li>Professional content strategy</li>
                        <li>Custom content templates</li>
                        <li>Brand voice development</li>
                        <li>Content calendar planning</li>
                        <li>Performance optimization</li>
                    </ul>
                    <a href="#contact" class="service-button">Learn More</a>
                </div>
                <div class="service-image" style="background-image: url('{{USER_SERVICE_PHOTO_2}}');"></div>
            </div>

            <!-- Service 3 -->
            <div class="service-detailed">
                <div class="service-text">
                    <h3>{{SERVICE_3_TITLE}}</h3>
                    <p>{{SERVICE_3_DESCRIPTION}}</p>
                    <div class="service-price">Investment varies</div>
                    <ul class="service-features">
                        <li>Complete brand transformation</li>
                        <li>VIP strategy intensive</li>
                        <li>Personal brand photoshoot</li>
                        <li>Website and marketing materials</li>
                        <li>6-month implementation support</li>
                    </ul>
                    <a href="#contact" class="service-button">Apply Now</a>
                </div>
                <div class="service-image" style="background-image: url('{{USER_SERVICE_PHOTO_3}}');"></div>
            </div>
        </div>
    </section>

    <!-- Process Section -->
    <section class="process-section">
        <div class="process-content">
            <h2 class="process-title">How We Work Together</h2>
            <div class="process-steps">
                <div class="process-step">
                    <div class="step-number">01</div>
                    <h3 class="step-title">Discovery</h3>
                    <p class="step-description">We start by understanding your story, goals, and vision for your business.</p>
                </div>
                <div class="process-step">
                    <div class="step-number">02</div>
                    <h3 class="step-title">Strategy</h3>
                    <p class="step-description">Together we develop a clear, authentic strategy that sets you apart.</p>
                </div>
                <div class="process-step">
                    <div class="step-number">03</div>
                    <h3 class="step-title">Implementation</h3>
                    <p class="step-description">We bring your strategy to life with practical, actionable steps.</p>
                </div>
                <div class="process-step">
                    <div class="step-number">04</div>
                    <h3 class="step-title">Growth</h3>
                    <p class="step-description">You launch with confidence, knowing your brand is authentically you.</p>
                </div>
            </div>
        </div>
    </section>

    <!-- FAQ Section -->
    <section class="faq-section">
        <div class="faq-content">
            <h2 class="faq-title">Common Questions</h2>
            <div class="faq-item">
                <h3 class="faq-question">How long does the process take?</h3>
                <p class="faq-answer">Every project is different, but most clients see initial results within 4-6 weeks. We work at a pace that ensures quality while respecting your timeline.</p>
            </div>
            <div class="faq-item">
                <h3 class="faq-question">What if I'm not sure what I need?</h3>
                <p class="faq-answer">That's exactly why we start with a discovery session. We'll help you identify what's working, what isn't, and what you need to reach your goals.</p>
            </div>
            <div class="faq-item">
                <h3 class="faq-question">Do you work with all industries?</h3>
                <p class="faq-answer">I specialize in working with {{TARGET_CLIENT}} who are ready to build an authentic, profitable personal brand. If that sounds like you, let's talk.</p>
            </div>
            <div class="faq-item">
                <h3 class="faq-question">What's included in the investment?</h3>
                <p class="faq-answer">Each service includes everything you need to succeed, plus ongoing support to ensure you get results. No hidden fees, no surprises.</p>
            </div>
        </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section">
        <div class="cta-content">
            <h2 class="cta-headline">Ready to get started?</h2>
            <p class="cta-text">Stop guessing and start growing. Let's create a strategy that's as unique as you are.</p>
            <a href="#contact" class="cta-button">Let's Work Together</a>
        </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
        <div class="footer-content">
            <div class="footer-links">
                <a href="mailto:{{CONTACT_EMAIL}}" class="footer-link">Email</a>
                <a href="https://instagram.com/{{INSTAGRAM_HANDLE}}" class="footer-link">Instagram</a>
                <a href="{{WEBSITE_URL}}" class="footer-link">Website</a>
            </div>
            <p class="footer-copyright">© 2025 {{USER_NAME}}. All rights reserved.</p>
        </div>
    </footer>
</body>
</html>`;

export const MULTI_PAGE_CONTACT_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Contact - {{USER_NAME}}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #0a0a0a; }
        
        /* Navigation - Same as other pages */
        .nav { position: fixed; top: 0; left: 0; right: 0; z-index: 1000; background: rgba(255,255,255,0.95); backdrop-filter: blur(10px); border-bottom: 1px solid #e5e5e5; padding: 20px 0; }
        .nav-container { max-width: 1400px; margin: 0 auto; padding: 0 40px; display: flex; justify-content: space-between; align-items: center; }
        .nav-logo { font-family: 'Times New Roman', serif; font-size: 20px; font-weight: 400; letter-spacing: -0.01em; color: #0a0a0a; text-decoration: none; }
        .nav-menu { display: flex; gap: 40px; }
        .nav-item { color: #0a0a0a; text-decoration: none; font-size: 11px; letter-spacing: 0.4em; text-transform: uppercase; transition: opacity 0.3s; }
        .nav-item:hover { opacity: 0.6; }
        .nav-item.active { opacity: 1; border-bottom: 1px solid #0a0a0a; }
        
        /* Hero Section - SAME DESIGN, "CONTACT" TITLE */
        .hero-section { 
            height: 100vh; 
            background: linear-gradient(rgba(10,10,10,0.3), rgba(10,10,10,0.3)), url('{{USER_HERO_PHOTO}}') center top/cover; 
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
        .hero-tagline { font-size: 11px; letter-spacing: 0.4em; text-transform: uppercase; color: rgba(255,255,255,0.7); margin-bottom: 24px; }
        .hero-title { 
            font-size: clamp(4rem, 10vw, 9rem); 
            line-height: 1; 
            font-weight: 200; 
            color: white; 
            font-family: 'Times New Roman', serif; 
            letter-spacing: 0.5em; 
            margin-bottom: 40px; 
        }
        
        /* Contact Content */
        .contact-intro { padding: 120px 40px; background: white; text-align: center; }
        .contact-intro-content { max-width: 800px; margin: 0 auto; }
        .contact-intro h2 { font-family: 'Times New Roman', serif; font-size: clamp(2.5rem, 5vw, 4rem); font-weight: 300; margin-bottom: 40px; }
        .contact-intro p { font-size: 18px; line-height: 1.7; color: #333; }
        
        .contact-form-section { padding: 120px 40px; background: #f5f5f5; }
        .contact-form-content { max-width: 800px; margin: 0 auto; }
        .contact-form-title { font-family: 'Times New Roman', serif; font-size: clamp(2rem, 4vw, 3rem); font-weight: 300; margin-bottom: 60px; text-align: center; }
        .contact-form { display: grid; gap: 30px; }
        .form-group { display: flex; flex-direction: column; }
        .form-label { font-size: 11px; letter-spacing: 0.4em; text-transform: uppercase; color: #666; margin-bottom: 8px; }
        .form-input, .form-textarea { padding: 20px; border: 1px solid #e5e5e5; background: white; font-size: 16px; color: #0a0a0a; font-family: inherit; transition: border-color 0.3s; }
        .form-input:focus, .form-textarea:focus { outline: none; border-color: #0a0a0a; }
        .form-textarea { resize: vertical; min-height: 150px; }
        .form-submit { background: #0a0a0a; color: white; padding: 20px 40px; border: none; cursor: pointer; font-size: 11px; letter-spacing: 0.4em; text-transform: uppercase; transition: background 0.3s; }
        .form-submit:hover { background: #333; }
        
        .contact-info { padding: 120px 40px; background: white; }
        .contact-info-content { max-width: 1000px; margin: 0 auto; }
        .contact-info-title { font-family: 'Times New Roman', serif; font-size: clamp(2rem, 4vw, 3rem); font-weight: 300; margin-bottom: 60px; text-align: center; }
        .contact-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 60px; text-align: center; }
        .contact-item h3 { font-family: 'Times New Roman', serif; font-size: 24px; margin-bottom: 16px; font-weight: 300; }
        .contact-item p { color: #666; line-height: 1.6; }
        .contact-item a { color: #0a0a0a; text-decoration: none; }
        .contact-item a:hover { opacity: 0.6; }
        
        /* FAQ Section */
        .faq-section { padding: 120px 40px; background: #f5f5f5; }
        .faq-content { max-width: 800px; margin: 0 auto; }
        .faq-title { font-family: 'Times New Roman', serif; font-size: clamp(2rem, 4vw, 3rem); font-weight: 300; margin-bottom: 60px; text-align: center; }
        .faq-item { margin-bottom: 40px; }
        .faq-question { font-family: 'Times New Roman', serif; font-size: 20px; margin-bottom: 12px; font-weight: 300; }
        .faq-answer { color: #666; line-height: 1.6; }
        
        /* Footer */
        .footer { background: #0a0a0a; color: rgba(255,255,255,0.7); padding: 80px 40px 40px; text-align: center; }
        .footer-content { max-width: 600px; margin: 0 auto; }
        .footer-links { display: flex; justify-content: center; gap: 40px; margin-bottom: 40px; flex-wrap: wrap; }
        .footer-link { color: rgba(255,255,255,0.7); text-decoration: none; font-size: 11px; letter-spacing: 0.4em; text-transform: uppercase; transition: color 0.3s; }
        .footer-link:hover { color: white; }
        .footer-copyright { font-size: 11px; letter-spacing: 0.4em; text-transform: uppercase; opacity: 0.5; }
        
        /* Responsive */
        @media (max-width: 768px) {
            .nav-container { padding: 0 20px; }
            .nav-menu { display: none; }
            .hero-section { padding: 60px 20px; }
            .contact-grid { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <!-- Navigation -->
    <nav class="nav">
        <div class="nav-container">
            <a href="/" class="nav-logo">{{USER_FIRST_NAME}}</a>
            <div class="nav-menu">
                <a href="/" class="nav-item">HOME</a>
                <a href="#about" class="nav-item">ABOUT</a>
                <a href="#services" class="nav-item">SERVICES</a>
                <a href="#contact" class="nav-item active">CONTACT</a>
            </div>
        </div>
    </nav>

    <!-- Hero Section -->
    <section class="hero-section">
        <div class="hero-content">
            <p class="hero-tagline">{{USER_TAGLINE}}</p>
            <h1 class="hero-title">CONTACT</h1>
        </div>
    </section>

    <!-- Contact Introduction -->
    <section class="contact-intro">
        <div class="contact-intro-content">
            <h2>Let's start your story</h2>
            <p>Ready to stop guessing and start growing? I'd love to hear about your vision and explore how we can work together to make it happen.</p>
        </div>
    </section>

    <!-- Contact Form -->
    <section class="contact-form-section">
        <div class="contact-form-content">
            <h2 class="contact-form-title">Tell me what's on your mind</h2>
            <form class="contact-form">
                <div class="form-group">
                    <label class="form-label">Your Name</label>
                    <input type="text" class="form-input" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Email Address</label>
                    <input type="email" class="form-input" required>
                </div>
                <div class="form-group">
                    <label class="form-label">What service interests you most?</label>
                    <select class="form-input">
                        <option>{{SERVICE_1_TITLE}}</option>
                        <option>{{SERVICE_2_TITLE}}</option>
                        <option>{{SERVICE_3_TITLE}}</option>
                        <option>Not sure yet</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Tell me about your business and goals</label>
                    <textarea class="form-textarea" placeholder="What's your biggest challenge right now? What would success look like for you?" required></textarea>
                </div>
                <button type="submit" class="form-submit">Send Message</button>
            </form>
        </div>
    </section>

    <!-- Contact Information -->
    <section class="contact-info">
        <div class="contact-info-content">
            <h2 class="contact-info-title">Other ways to connect</h2>
            <div class="contact-grid">
                <div class="contact-item">
                    <h3>Email</h3>
                    <p><a href="mailto:{{CONTACT_EMAIL}}">{{CONTACT_EMAIL}}</a></p>
                    <p>Best for detailed questions and project inquiries</p>
                </div>
                <div class="contact-item">
                    <h3>Instagram</h3>
                    <p><a href="https://instagram.com/{{INSTAGRAM_HANDLE}}" target="_blank">@{{INSTAGRAM_HANDLE}}</a></p>
                    <p>Daily inspiration and behind-the-scenes content</p>
                </div>
                <div class="contact-item">
                    <h3>Response Time</h3>
                    <p>Within 24-48 hours</p>
                    <p>I personally read and respond to every message</p>
                </div>
            </div>
        </div>
    </section>

    <!-- FAQ Section -->
    <section class="faq-section">
        <div class="faq-content">
            <h2 class="faq-title">Before you reach out</h2>
            <div class="faq-item">
                <h3 class="faq-question">What happens after I contact you?</h3>
                <p class="faq-answer">I'll respond within 24-48 hours to schedule a complimentary consultation where we'll discuss your goals and see if we're a good fit to work together.</p>
            </div>
            <div class="faq-item">
                <h3 class="faq-question">Do you work with businesses outside your specialty?</h3>
                <p class="faq-answer">I focus on {{TARGET_CLIENT}} because that's where I get the best results. If you're not sure if we're a match, let's talk anyway—I'm happy to point you in the right direction.</p>
            </div>
            <div class="faq-item">
                <h3 class="faq-question">What's your availability like?</h3>
                <p class="faq-answer">I work with a limited number of clients to ensure everyone gets the attention they deserve. Current availability varies, but I'll let you know exactly where things stand when we connect.</p>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
        <div class="footer-content">
            <div class="footer-links">
                <a href="mailto:{{CONTACT_EMAIL}}" class="footer-link">Email</a>
                <a href="https://instagram.com/{{INSTAGRAM_HANDLE}}" class="footer-link">Instagram</a>
                <a href="{{WEBSITE_URL}}" class="footer-link">Website</a>
            </div>
            <p class="footer-copyright">© 2025 {{USER_NAME}}. All rights reserved.</p>
        </div>
    </footer>
</body>
</html>`;