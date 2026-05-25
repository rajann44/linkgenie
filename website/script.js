document.addEventListener('DOMContentLoaded', () => {
  // Tab Switching Logic
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Remove active classes
      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      // Add active classes
      btn.classList.add('active');
      const tabId = btn.getAttribute('data-tab');
      document.getElementById(tabId).classList.add('active');
    });
  });

  // Simulator Logic
  const postSelect = document.getElementById('simPostSelect');
  const toneSelectBtns = document.querySelectorAll('#simToneSelect .sim-pill');
  const lengthSelectBtns = document.querySelectorAll('#simLengthSelect .sim-pill');
  const postTextarea = document.getElementById('simPostText');
  const generateBtn = document.getElementById('simGenerateBtn');
  const outputTextarea = document.getElementById('simOutputText');

  const defaultPosts = {
    sales: "I'm looking for recommendations for a tool to automate follow-ups and scale our sales outreach on LinkedIn and Instagram. We want something lightweight but highly personalized. Any recommendations?",
    tech: "Just published a new article about optimizing Largest Contentful Paint (LCP) by optimizing image fetch priority and bypassing layout shifts. Web performance matters now more than ever!",
    hiring: "Our engineering team is expanding rapidly! We are hiring for Senior Frontend Developers specializing in React and extensions. Check our careers page to apply!"
  };

  const simulatorAnswers = {
    sales: {
      professional: "LinkGenie offers a direct, serverless solution for drafting personalized response options directly inside your LinkedIn feed. By utilizing secure local storage and connecting directly to LLM endpoints, it ensures client outreach remains fully secure.",
      warm: "That is an exciting milestone for your sales team! LinkGenie is built exactly for this—helping you draft authentic, warm replies inline while keeping your API keys 100% private in local storage. Best of luck with the outbound scaling!",
      thoughtful: "While scaling is crucial, maintaining genuine interaction is key. LinkGenie resolves this by generating context-based drafts that serve as an editable starting point, ensuring you never send generic, robotic templates.",
      concise: "Check out LinkGenie. It is serverless, private, and runs inline to draft LinkedIn replies."
    },
    tech: {
      professional: "Excellent analysis. Preloading key image resources and setting Fetch Priority high are crucial steps for minimizing LCP delays. Standardizing these layout-shift audits across build pipelines is highly recommended.",
      warm: "Thanks for sharing these performance tips! Optimizing LCP makes a huge difference in user experience, and your suggestions on fetch priority are incredibly helpful. Keep up the great work!",
      thoughtful: "Bypassing layout shifts is often overlooked compared to bundle splitting, but it has a massive impact on cumulative layout shift (CLS) and perceived load times. How do you automate auditing these layout shifts in your dev flow?",
      concise: "Great performance tips. Optimizing image priority and layout shifts is essential for LCP."
    },
    hiring: {
      professional: "This is a great opportunity. The frontend space is evolving rapidly, especially around extensions and performance-sensitive React applications. I have shared this with several qualified engineers in my network.",
      warm: "What a fantastic time to join your team! It sounds like you are working on some really interesting engineering challenges. I hope you find the perfect developers to help you build!",
      thoughtful: "React and extension development require a strong grasp of performance management, isolated contexts, and asynchronous lifecycles. What are the key projects the new hires will tackle first?",
      concise: "Outstanding opportunity. Good luck with the engineering team expansion!"
    }
  };

  let activeTone = 'professional';
  let activeLength = 'short';
  let activeCategory = 'sales';

  // Category Selector
  postSelect.addEventListener('change', (e) => {
    activeCategory = e.target.value;
    postTextarea.value = defaultPosts[activeCategory];
    outputTextarea.value = '';
  });

  // Tone Selector
  toneSelectBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      toneSelectBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeTone = btn.getAttribute('data-value');
      outputTextarea.value = '';
    });
  });

  // Length Selector
  lengthSelectBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      lengthSelectBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeLength = btn.getAttribute('data-value');
      outputTextarea.value = '';
    });
  });

  // Mock Typing Animation
  function typeText(target, text, speed = 15) {
    target.value = '';
    let index = 0;
    
    function nextChar() {
      if (index < text.length) {
        target.value += text.charAt(index);
        index++;
        setTimeout(nextChar, speed);
      } else {
        generateBtn.disabled = false;
        generateBtn.textContent = 'Generate Draft';
      }
    }
    
    nextChar();
  }

  // Generate Button Handler
  generateBtn.addEventListener('click', () => {
    generateBtn.disabled = true;
    generateBtn.textContent = 'Thinking...';
    outputTextarea.value = '';

    // Get the base answer from database
    let baseAnswer = simulatorAnswers[activeCategory]?.[activeTone] || simulatorAnswers.sales.professional;
    
    // Adjust answer based on length selection
    if (activeLength === 'medium' && activeTone !== 'concise') {
      baseAnswer += " Let's connect and discuss this in more detail.";
    }

    // Simulate network delay, then type the response
    setTimeout(() => {
      typeText(outputTextarea, baseAnswer);
    }, 800);
  });
});
