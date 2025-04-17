
document.addEventListener('DOMContentLoaded', function() {
  // Initialize Lucide icons
  lucide.createIcons();
  
  // Handle header transparency on scroll
  const header = document.getElementById('header');
  
  window.addEventListener('scroll', function() {
    if (window.scrollY > 10) {
      header.classList.add('bg-white/80', 'backdrop-blur-md', 'shadow-subtle');
    } else {
      header.classList.remove('bg-white/80', 'backdrop-blur-md', 'shadow-subtle');
    }
  });
  
  // Multi-step form handling
  let currentStep = 1;
  const totalSteps = 5;
  const steps = [];
  const stepIndicators = document.querySelectorAll('.step-indicator');
  const nextButton = document.getElementById('nextButton');
  const prevButton = document.getElementById('prevButton');
  const submitButton = document.getElementById('submitButton');
  const prevButtonContainer = document.getElementById('prevButtonContainer');
  
  // Get all steps
  for (let i = 1; i <= totalSteps; i++) {
    steps.push(document.getElementById(`step${i}`));
  }
  
  // Initialize form data object
  const formData = {
    dreamProfession: '',
    studentLife: '',
    studyGoals: '',
    resume: null,
    personalInfo: {
      name: '',
      nationality: '',
      email: ''
    }
  };
  
  // Handle file upload
  const resumeUpload = document.getElementById('resumeUpload');
  const fileName = document.getElementById('fileName');
  
  resumeUpload.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        showToast('File too large', 'Please upload a file smaller than 5MB', 'error');
        return;
      }
      fileName.textContent = file.name;
      formData.resume = file;
    }
  });
  
  // Handle next button click
  nextButton.addEventListener('click', function() {
    // Save current step data
    saveStepData(currentStep);
    
    // Move to next step
    if (currentStep < totalSteps) {
      steps[currentStep - 1].classList.add('hidden');
      currentStep++;
      steps[currentStep - 1].classList.remove('hidden');
      
      // Show previous button after step 1
      prevButtonContainer.classList.remove('hidden');
      
      // Show submit button on last step
      if (currentStep === totalSteps) {
        nextButton.classList.add('hidden');
        submitButton.classList.remove('hidden');
      }
      
      // Update step indicators
      updateStepIndicators();
    }
  });
  
  // Handle previous button click
  prevButton.addEventListener('click', function() {
    if (currentStep > 1) {
      // Hide current step
      steps[currentStep - 1].classList.add('hidden');
      currentStep--;
      steps[currentStep - 1].classList.remove('hidden');
      
      // Hide previous button on first step
      if (currentStep === 1) {
        prevButtonContainer.classList.add('hidden');
      }
      
      // Show next button if coming back from last step
      if (currentStep === totalSteps - 1) {
        nextButton.classList.remove('hidden');
        submitButton.classList.add('hidden');
      }
      
      // Update step indicators
      updateStepIndicators();
    }
  });
  
  // Handle form submission
  submitButton.addEventListener('click', function(e) {
    e.preventDefault();
    
    // Save data from the final step
    saveStepData(currentStep);
    
    // Log form data (would be sent to server in a real app)
    console.log('Form submitted:', formData);
    
    // Show success message
    showToast('Success!', 'Your information has been submitted successfully.');
    
    // Navigate to report page after short delay
    setTimeout(() => {
      document.getElementById('app').classList.add('hidden');
      document.getElementById('reportPage').classList.remove('hidden');
      window.scrollTo(0, 0);
    }, 1500);
  });
  
  // Helper function to save data at each step
  function saveStepData(step) {
    switch(step) {
      case 1:
        formData.dreamProfession = document.getElementById('dreamProfession').value;
        break;
      case 2:
        formData.studentLife = document.getElementById('studentLife').value;
        break;
      case 3:
        formData.studyGoals = document.getElementById('studyGoals').value;
        break;
      // Step 4 (resume) is handled by the file input event listener
      case 5:
        formData.personalInfo.name = document.getElementById('name').value;
        formData.personalInfo.nationality = document.getElementById('nationality').value;
        formData.personalInfo.email = document.getElementById('email').value;
        break;
    }
  }
  
  // Helper function to update step indicators
  function updateStepIndicators() {
    stepIndicators.forEach((indicator, index) => {
      if (index === currentStep - 1) {
        indicator.classList.add('bg-blue', 'scale-125');
        indicator.classList.remove('bg-white/30');
      } else {
        indicator.classList.add('bg-white/30');
        indicator.classList.remove('bg-blue', 'scale-125');
      }
    });
  }
  
  // Toast notification function
  function showToast(title, message, type = 'success') {
    const toast = document.getElementById('toast');
    const icon = toast.querySelector('[data-lucide]');
    
    // Set content
    toast.querySelector('h4').textContent = title;
    toast.querySelector('p').textContent = message;
    
    // Set icon based on type
    if (type === 'error') {
      icon.setAttribute('data-lucide', 'x-circle');
      icon.parentNode.classList.replace('text-green-500', 'text-red-500');
    } else {
      icon.setAttribute('data-lucide', 'check-circle');
      icon.parentNode.classList.replace('text-red-500', 'text-green-500');
    }
    
    // Update icon
    lucide.createIcons();
    
    // Show toast
    toast.classList.add('toast-visible');
    toast.classList.remove('toast-hidden', 'translate-x-full');
    
    // Hide toast after 3 seconds
    setTimeout(() => {
      toast.classList.remove('toast-visible');
      toast.classList.add('toast-hidden');
    }, 3000);
  }
  
  // Scroll to form section function
  window.scrollToForm = function() {
    document.getElementById('form-section').scrollIntoView({ behavior: 'smooth' });
  }
  
  // Check if we should show the report page (e.g., if redirected from form submission)
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('showReport')) {
    document.getElementById('app').classList.add('hidden');
    document.getElementById('reportPage').classList.remove('hidden');
  }
});
