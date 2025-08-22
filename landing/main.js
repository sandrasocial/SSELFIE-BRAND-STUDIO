document.addEventListener('DOMContentLoaded', function() {
    const waitlistForm = document.getElementById('waitlist-form');
    
    waitlistForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = this.querySelector('input[type="email"]').value;
        const planType = this.querySelector('select').value;
        
        try {
            const response = await fetch('/api/waitlist/join', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    plan_type: planType
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Show success message
                waitlistForm.innerHTML = `
                    <div class="success-message">
                        <h3>🎉 You're on the list!</h3>
                        <p>Thank you for joining the SSELFIE Studio waitlist. We'll notify you when we launch!</p>
                    </div>
                `;
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to join waitlist. Please try again.');
        }
    });
    
    // Smooth scroll for navigation
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
});