/**
 * Assessment JavaScript
 * Handles the self-assessment health screening tools
 */

// Health Assessment module
const HealthAssessment = {
  // Current assessment data
  currentAssessment: null,
  
  // Available health assessments
  assessments: [
    {
      id: 'general-health',
      title: 'General Health Check',
      description: 'A basic assessment of your overall health and wellness.',
      icon: 'activity',
      questions: [
        {
          id: 'energy',
          text: 'How would you rate your energy level on most days?',
          type: 'scale',
          options: [
            { value: 1, label: 'Very low' },
            { value: 2, label: 'Low' },
            { value: 3, label: 'Moderate' },
            { value: 4, label: 'High' },
            { value: 5, label: 'Very high' }
          ]
        },
        {
          id: 'sleep',
          text: 'How many hours of sleep do you typically get each night?',
          type: 'select',
          options: [
            { value: 'less-than-4', label: 'Less than 4 hours' },
            { value: '4-5', label: '4-5 hours' },
            { value: '6-7', label: '6-7 hours' },
            { value: '7-8', label: '7-8 hours' },
            { value: 'more-than-8', label: 'More than 8 hours' }
          ]
        },
        {
          id: 'nutrition',
          text: 'How many servings of fruits and vegetables do you eat daily?',
          type: 'select',
          options: [
            { value: 'none', label: 'None' },
            { value: '1-2', label: '1-2 servings' },
            { value: '3-4', label: '3-4 servings' },
            { value: '5-plus', label: '5 or more servings' }
          ]
        },
        {
          id: 'exercise',
          text: 'How often do you engage in moderate physical activity for at least 30 minutes?',
          type: 'select',
          options: [
            { value: 'never', label: 'Never' },
            { value: 'rarely', label: 'Rarely (few times a month)' },
            { value: 'sometimes', label: 'Sometimes (once a week)' },
            { value: 'often', label: '2-3 times a week' },
            { value: 'daily', label: 'Daily or almost daily' }
          ]
        },
        {
          id: 'stress',
          text: 'How would you rate your stress level on most days?',
          type: 'scale',
          options: [
            { value: 1, label: 'Very low' },
            { value: 2, label: 'Low' },
            { value: 3, label: 'Moderate' },
            { value: 4, label: 'High' },
            { value: 5, label: 'Very high' }
          ]
        },
        {
          id: 'water',
          text: 'How many glasses of water do you drink daily?',
          type: 'select',
          options: [
            { value: 'less-than-2', label: 'Less than 2' },
            { value: '2-4', label: '2-4 glasses' },
            { value: '5-7', label: '5-7 glasses' },
            { value: '8-plus', label: '8 or more glasses' }
          ]
        },
        {
          id: 'checkup',
          text: 'When was your last regular health check-up with a healthcare provider?',
          type: 'select',
          options: [
            { value: 'never', label: 'Never had one' },
            { value: 'more-than-3-years', label: 'More than 3 years ago' },
            { value: '1-3-years', label: '1-3 years ago' },
            { value: 'less-than-1-year', label: 'Less than a year ago' }
          ]
        }
      ]
    },
    {
      id: 'diabetes-risk',
      title: 'Diabetes Risk Assessment',
      description: 'Evaluate your risk factors for developing type 2 diabetes.',
      icon: 'droplet',
      questions: [
        {
          id: 'age',
          text: 'What is your age?',
          type: 'select',
          options: [
            { value: 'under-40', label: 'Under 40 years', score: 0 },
            { value: '40-49', label: '40-49 years', score: 1 },
            { value: '50-59', label: '50-59 years', score: 2 },
            { value: '60-plus', label: '60+ years', score: 3 }
          ]
        },
        {
          id: 'bmi',
          text: 'What is your BMI (Body Mass Index)? If you don\'t know, select "I don\'t know" for guidance on calculating it.',
          type: 'select',
          options: [
            { value: 'dont-know', label: 'I don\'t know', score: 0 },
            { value: 'under-25', label: 'Less than 25', score: 0 },
            { value: '25-30', label: '25-30', score: 1 },
            { value: '30-plus', label: 'Above 30', score: 2 }
          ]
        },
        {
          id: 'waist',
          text: 'Measure your waist circumference at the level of your navel. What is your waist measurement?',
          type: 'select',
          options: [
            { value: 'dont-know', label: 'I don\'t know', score: 0 },
            { value: 'men-under-37-women-under-31', label: 'For men: less than 37 inches / For women: less than 31 inches', score: 0 },
            { value: 'men-37-40-women-31-35', label: 'For men: 37-40 inches / For women: 31-35 inches', score: 1 },
            { value: 'men-over-40-women-over-35', label: 'For men: over 40 inches / For women: over 35 inches', score: 2 }
          ]
        },
        {
          id: 'activity',
          text: 'Are you physically active for at least 30 minutes daily?',
          type: 'select',
          options: [
            { value: 'yes', label: 'Yes', score: 0 },
            { value: 'no', label: 'No', score: 1 }
          ]
        },
        {
          id: 'diet',
          text: 'How often do you eat vegetables and fruits?',
          type: 'select',
          options: [
            { value: 'daily', label: 'Every day', score: 0 },
            { value: 'not-daily', label: 'Not every day', score: 1 }
          ]
        },
        {
          id: 'blood-pressure',
          text: 'Have you ever been diagnosed with high blood pressure?',
          type: 'select',
          options: [
            { value: 'no', label: 'No', score: 0 },
            { value: 'yes', label: 'Yes', score: 1 }
          ]
        },
        {
          id: 'blood-glucose',
          text: 'Have you ever been found to have high blood glucose (sugar)?',
          type: 'select',
          options: [
            { value: 'no', label: 'No', score: 0 },
            { value: 'yes', label: 'Yes', score: 2 }
          ]
        },
        {
          id: 'family-history',
          text: 'Do you have a family history of diabetes (parent, sibling)?',
          type: 'select',
          options: [
            { value: 'no', label: 'No', score: 0 },
            { value: 'yes', label: 'Yes', score: 2 }
          ]
        }
      ]
    },
    {
      id: 'heart-health',
      title: 'Heart Health Assessment',
      description: 'Evaluate your cardiovascular health and risk factors.',
      icon: 'heart',
      questions: [
        {
          id: 'blood-pressure',
          text: 'Do you know your blood pressure?',
          type: 'select',
          options: [
            { value: 'normal', label: 'Normal (less than 120/80)' },
            { value: 'elevated', label: 'Elevated (120-129/less than 80)' },
            { value: 'high-stage1', label: 'High Stage 1 (130-139/80-89)' },
            { value: 'high-stage2', label: 'High Stage 2 (140+/90+)' },
            { value: 'dont-know', label: 'I don\'t know' }
          ]
        },
        {
          id: 'cholesterol',
          text: 'Do you know your cholesterol levels?',
          type: 'select',
          options: [
            { value: 'normal', label: 'Normal (Total < 200, LDL < 100, HDL > 60)' },
            { value: 'borderline', label: 'Borderline high' },
            { value: 'high', label: 'High' },
            { value: 'dont-know', label: 'I don\'t know' }
          ]
        },
        {
          id: 'smoking',
          text: 'Do you smoke tobacco products?',
          type: 'select',
          options: [
            { value: 'never', label: 'Never smoked' },
            { value: 'former', label: 'Former smoker' },
            { value: 'current', label: 'Current smoker' }
          ]
        },
        {
          id: 'diabetes',
          text: 'Do you have diabetes?',
          type: 'select',
          options: [
            { value: 'no', label: 'No' },
            { value: 'prediabetes', label: 'Prediabetes' },
            { value: 'yes', label: 'Yes' },
            { value: 'dont-know', label: 'I don\'t know' }
          ]
        },
        {
          id: 'exercise',
          text: 'How often do you engage in moderate to vigorous physical activity?',
          type: 'select',
          options: [
            { value: 'rarely', label: 'Rarely or never' },
            { value: 'sometimes', label: '1-2 times per week' },
            { value: 'regular', label: '3-4 times per week' },
            { value: 'frequent', label: '5+ times per week' }
          ]
        },
        {
          id: 'family-history',
          text: 'Do you have a family history of heart disease?',
          type: 'select',
          options: [
            { value: 'no', label: 'No' },
            { value: 'yes-distant', label: 'Yes (extended family)' },
            { value: 'yes-immediate', label: 'Yes (immediate family)' },
            { value: 'dont-know', label: 'I don\'t know' }
          ]
        },
        {
          id: 'diet',
          text: 'How would you describe your diet?',
          type: 'select',
          options: [
            { value: 'poor', label: 'High in processed foods, salt, and sugar' },
            { value: 'fair', label: 'Moderate balance of healthy and unhealthy foods' },
            { value: 'good', label: 'Mostly fruits, vegetables, whole grains, lean proteins' },
            { value: 'excellent', label: 'Heart-healthy diet (low sodium, low saturated fat, high fiber)' }
          ]
        },
        {
          id: 'stress',
          text: 'How would you rate your stress level most days?',
          type: 'scale',
          options: [
            { value: 1, label: 'Very low' },
            { value: 2, label: 'Low' },
            { value: 3, label: 'Moderate' },
            { value: 4, label: 'High' },
            { value: 5, label: 'Very high' }
          ]
        }
      ]
    }
  ],
  
  // Initialize assessment functionality
  init: function() {
    console.log('Initializing health assessment tools...');
    
    // Initialize UI components
    this.renderAssessmentCards();
    this.initEventListeners();
    
    console.log('Health assessment tools initialized');
  },
  
  // Render the assessment cards on the assessment page
  renderAssessmentCards: function() {
    const assessmentContainer = document.getElementById('assessmentContainer');
    if (!assessmentContainer) return;
    
    assessmentContainer.innerHTML = '';
    
    // Create cards for each assessment
    this.assessments.forEach(assessment => {
      const card = document.createElement('div');
      card.className = 'assessment-card';
      card.dataset.assessmentId = assessment.id;
      
      card.innerHTML = `
        <div class="assessment-card-icon">
          <i data-feather="${assessment.icon}"></i>
        </div>
        <div class="assessment-card-content">
          <h3>${assessment.title}</h3>
          <p>${assessment.description}</p>
          <button class="btn btn-primary start-assessment" data-assessment-id="${assessment.id}">
            Start Assessment
          </button>
        </div>
      `;
      
      assessmentContainer.appendChild(card);
    });
    
    // Replace Feather icons
    feather.replace();
  },
  
  // Initialize event listeners
  initEventListeners: function() {
    // Listen for clicks on the start assessment buttons
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('start-assessment') || 
          e.target.closest('.start-assessment')) {
        const button = e.target.classList.contains('start-assessment') ? 
                       e.target : 
                       e.target.closest('.start-assessment');
        const assessmentId = button.dataset.assessmentId;
        this.startAssessment(assessmentId);
      }
      
      // Next question button
      if (e.target.id === 'nextQuestion' || e.target.closest('#nextQuestion')) {
        this.nextQuestion();
      }
      
      // Previous question button
      if (e.target.id === 'prevQuestion' || e.target.closest('#prevQuestion')) {
        this.prevQuestion();
      }
      
      // Submit assessment button
      if (e.target.id === 'submitAssessment' || e.target.closest('#submitAssessment')) {
        this.submitAssessment();
      }
      
      // Restart assessment button
      if (e.target.id === 'restartAssessment' || e.target.closest('#restartAssessment')) {
        this.renderAssessmentCards();
      }
      
      // Save results button
      if (e.target.id === 'saveResults' || e.target.closest('#saveResults')) {
        this.saveResults();
      }
    });
    
    // Listen for assessment form submissions
    const assessmentForm = document.getElementById('assessmentForm');
    if (assessmentForm) {
      assessmentForm.addEventListener('submit', (e) => {
        e.preventDefault();
      });
    }
  },
  
  // Start a specific assessment
  startAssessment: function(assessmentId) {
    // Find the assessment by ID
    const assessment = this.assessments.find(a => a.id === assessmentId);
    if (!assessment) {
      console.error('Assessment not found:', assessmentId);
      return;
    }
    
    console.log('Starting assessment:', assessment.title);
    
    // Set as current assessment
    this.currentAssessment = {
      ...assessment,
      currentQuestionIndex: 0,
      answers: Array(assessment.questions.length).fill(null)
    };
    
    // Change the UI to show the assessment
    const assessmentContainer = document.getElementById('assessmentContainer');
    assessmentContainer.innerHTML = '';
    
    // Create assessment interface
    const assessmentInterface = document.createElement('div');
    assessmentInterface.className = 'assessment-interface';
    assessmentInterface.innerHTML = `
      <div class="assessment-header">
        <h2>${assessment.title}</h2>
        <div class="assessment-progress">
          <div class="progress-bar">
            <div class="progress-fill" style="width: 0%"></div>
          </div>
          <span class="progress-text">Question 1 of ${assessment.questions.length}</span>
        </div>
      </div>
      
      <form id="assessmentForm">
        <div class="question-container"></div>
        
        <div class="assessment-controls">
          <button type="button" id="prevQuestion" class="btn btn-secondary" disabled>Previous</button>
          <button type="button" id="nextQuestion" class="btn btn-primary">Next</button>
          <button type="button" id="submitAssessment" class="btn btn-success" style="display: none;">Submit</button>
        </div>
      </form>
    `;
    
    assessmentContainer.appendChild(assessmentInterface);
    
    // Show the first question
    this.showQuestion(0);
  },
  
  // Show a specific question
  showQuestion: function(index) {
    if (!this.currentAssessment) return;
    
    // Make sure index is valid
    if (index < 0 || index >= this.currentAssessment.questions.length) {
      console.error('Invalid question index:', index);
      return;
    }
    
    // Update current question index
    this.currentAssessment.currentQuestionIndex = index;
    
    // Get the question
    const question = this.currentAssessment.questions[index];
    
    // Update progress bar
    const progressPercent = (index / (this.currentAssessment.questions.length - 1)) * 100;
    const progressFill = document.querySelector('.progress-fill');
    if (progressFill) {
      progressFill.style.width = `${progressPercent}%`;
    }
    
    const progressText = document.querySelector('.progress-text');
    if (progressText) {
      progressText.textContent = `Question ${index + 1} of ${this.currentAssessment.questions.length}`;
    }
    
    // Show/hide prev/next/submit buttons
    const prevButton = document.getElementById('prevQuestion');
    const nextButton = document.getElementById('nextQuestion');
    const submitButton = document.getElementById('submitAssessment');
    
    if (prevButton) {
      prevButton.disabled = index === 0;
    }
    
    if (nextButton && submitButton) {
      if (index === this.currentAssessment.questions.length - 1) {
        nextButton.style.display = 'none';
        submitButton.style.display = 'inline-block';
      } else {
        nextButton.style.display = 'inline-block';
        submitButton.style.display = 'none';
      }
    }
    
    // Render the question
    const questionContainer = document.querySelector('.question-container');
    if (!questionContainer) return;
    
    let optionsHtml = '';
    
    // Generate different HTML based on question type
    if (question.type === 'select') {
      optionsHtml = `
        <div class="form-group">
          <select id="question_${question.id}" class="form-control">
            <option value="">-- Please select --</option>
            ${question.options.map(option => `
              <option value="${option.value}" ${this.currentAssessment.answers[index] === option.value ? 'selected' : ''}>
                ${option.label}
              </option>
            `).join('')}
          </select>
        </div>
      `;
    } else if (question.type === 'scale') {
      optionsHtml = `
        <div class="scale-options">
          ${question.options.map(option => `
            <div class="scale-option">
              <label class="scale-label">
                <input 
                  type="radio" 
                  name="question_${question.id}" 
                  value="${option.value}"
                  ${this.currentAssessment.answers[index] === option.value.toString() ? 'checked' : ''}
                >
                <span>${option.label}</span>
              </label>
            </div>
          `).join('')}
        </div>
      `;
    }
    
    questionContainer.innerHTML = `
      <div class="question">
        <h3 class="question-text">${question.text}</h3>
        ${optionsHtml}
      </div>
    `;
    
    // Add event listeners to inputs
    if (question.type === 'select') {
      const select = document.getElementById(`question_${question.id}`);
      if (select) {
        select.addEventListener('change', (e) => {
          this.currentAssessment.answers[index] = e.target.value;
        });
      }
    } else if (question.type === 'scale') {
      const radioButtons = document.querySelectorAll(`input[name="question_${question.id}"]`);
      radioButtons.forEach(radio => {
        radio.addEventListener('change', (e) => {
          this.currentAssessment.answers[index] = e.target.value;
        });
      });
    }
  },
  
  // Move to the next question
  nextQuestion: function() {
    if (!this.currentAssessment) return;
    
    const currentIndex = this.currentAssessment.currentQuestionIndex;
    const currentQuestion = this.currentAssessment.questions[currentIndex];
    
    // Get the current answer
    let currentAnswer = null;
    
    if (currentQuestion.type === 'select') {
      const select = document.getElementById(`question_${currentQuestion.id}`);
      if (select) {
        currentAnswer = select.value;
      }
    } else if (currentQuestion.type === 'scale') {
      const checkedRadio = document.querySelector(`input[name="question_${currentQuestion.id}"]:checked`);
      if (checkedRadio) {
        currentAnswer = checkedRadio.value;
      }
    }
    
    // Validate the answer
    if (!currentAnswer) {
      HealthAccess.showNotification('Please answer the question before continuing.', 'warning');
      return;
    }
    
    // Save the answer
    this.currentAssessment.answers[currentIndex] = currentAnswer;
    
    // Move to next question if not at the end
    if (currentIndex < this.currentAssessment.questions.length - 1) {
      this.showQuestion(currentIndex + 1);
    }
  },
  
  // Move to the previous question
  prevQuestion: function() {
    if (!this.currentAssessment) return;
    
    const currentIndex = this.currentAssessment.currentQuestionIndex;
    
    // Move to previous question if not at the beginning
    if (currentIndex > 0) {
      this.showQuestion(currentIndex - 1);
    }
  },
  
  // Submit the assessment and show results
  submitAssessment: function() {
    if (!this.currentAssessment) return;
    
    // Check if all questions have been answered
    const unansweredIndex = this.currentAssessment.answers.findIndex(answer => answer === null);
    
    if (unansweredIndex !== -1) {
      // Show the unanswered question
      this.showQuestion(unansweredIndex);
      HealthAccess.showNotification('Please answer all questions before submitting.', 'warning');
      return;
    }
    
    console.log('Assessment completed:', this.currentAssessment.title);
    console.log('Answers:', this.currentAssessment.answers);
    
    // Calculate results based on assessment type
    const results = this.calculateResults();
    
    // Show results screen
    this.showResults(results);
  },
  
  // Calculate assessment results
  calculateResults: function() {
    // Different calculation logic based on assessment type
    switch (this.currentAssessment.id) {
      case 'general-health':
        return this.calculateGeneralHealthResults();
      case 'diabetes-risk':
        return this.calculateDiabetesRiskResults();
      case 'heart-health':
        return this.calculateHeartHealthResults();
      default:
        console.error('Unknown assessment type for results calculation');
        return { score: 0, level: 'Unknown', recommendations: [] };
    }
  },
  
  // Calculate general health assessment results
  calculateGeneralHealthResults: function() {
    const answers = this.currentAssessment.answers;
    const results = {
      areas: {
        energy: { score: 0, status: '' },
        sleep: { score: 0, status: '' },
        nutrition: { score: 0, status: '' },
        exercise: { score: 0, status: '' },
        stress: { score: 0, status: '' },
        hydration: { score: 0, status: '' },
        preventive: { score: 0, status: '' }
      },
      overallScore: 0,
      wellnessLevel: '',
      recommendations: []
    };
    
    // Calculate individual area scores
    
    // Energy (Q1)
    const energyRating = parseInt(answers[0]);
    results.areas.energy.score = energyRating;
    if (energyRating <= 2) {
      results.areas.energy.status = 'Needs Improvement';
      results.recommendations.push('Consider discussing low energy levels with a healthcare provider.');
    } else if (energyRating === 3) {
      results.areas.energy.status = 'Moderate';
      results.recommendations.push('Try to identify activities or times when your energy is highest and schedule important tasks then.');
    } else {
      results.areas.energy.status = 'Good';
    }
    
    // Sleep (Q2)
    switch (answers[1]) {
      case 'less-than-4':
        results.areas.sleep.score = 1;
        results.areas.sleep.status = 'Needs Improvement';
        results.recommendations.push('Chronic sleep deprivation can severely impact health. Consider speaking with a healthcare provider about sleep issues.');
        break;
      case '4-5':
        results.areas.sleep.score = 2;
        results.areas.sleep.status = 'Needs Improvement';
        results.recommendations.push('Try to increase your sleep duration to at least 7 hours per night.');
        break;
      case '6-7':
        results.areas.sleep.score = 3;
        results.areas.sleep.status = 'Moderate';
        results.recommendations.push('You\'re getting close to the recommended amount of sleep. Try to get a full 7-8 hours when possible.');
        break;
      case '7-8':
        results.areas.sleep.score = 5;
        results.areas.sleep.status = 'Good';
        break;
      case 'more-than-8':
        results.areas.sleep.score = 4;
        results.areas.sleep.status = 'Good';
        break;
    }
    
    // Nutrition (Q3)
    switch (answers[2]) {
      case 'none':
        results.areas.nutrition.score = 1;
        results.areas.nutrition.status = 'Needs Improvement';
        results.recommendations.push('Try to gradually add fruits and vegetables to your diet, aiming for at least 5 servings daily.');
        break;
      case '1-2':
        results.areas.nutrition.score = 2;
        results.areas.nutrition.status = 'Needs Improvement';
        results.recommendations.push('Increase your fruit and vegetable intake to at least 5 servings daily.');
        break;
      case '3-4':
        results.areas.nutrition.score = 4;
        results.areas.nutrition.status = 'Moderate';
        results.recommendations.push('You\'re doing well with fruits and vegetables. Try to reach 5 or more servings daily.');
        break;
      case '5-plus':
        results.areas.nutrition.score = 5;
        results.areas.nutrition.status = 'Good';
        break;
    }
    
    // Exercise (Q4)
    switch (answers[3]) {
      case 'never':
        results.areas.exercise.score = 1;
        results.areas.exercise.status = 'Needs Improvement';
        results.recommendations.push('Start with short walks and gradually build up to 30 minutes of physical activity most days.');
        break;
      case 'rarely':
        results.areas.exercise.score = 2;
        results.areas.exercise.status = 'Needs Improvement';
        results.recommendations.push('Try to increase your physical activity to at least 150 minutes per week.');
        break;
      case 'sometimes':
        results.areas.exercise.score = 3;
        results.areas.exercise.status = 'Moderate';
        results.recommendations.push('You\'re on the right track with exercise. Aim for at least 30 minutes of activity 5 days a week.');
        break;
      case 'often':
        results.areas.exercise.score = 4;
        results.areas.exercise.status = 'Good';
        break;
      case 'daily':
        results.areas.exercise.score = 5;
        results.areas.exercise.status = 'Good';
        break;
    }
    
    // Stress (Q5)
    const stressRating = parseInt(answers[4]);
    results.areas.stress.score = 6 - stressRating; // Invert scale since lower stress is better
    if (stressRating >= 4) {
      results.areas.stress.status = 'Needs Improvement';
      results.recommendations.push('Consider stress management techniques like meditation, deep breathing, or speaking with a mental health professional.');
    } else if (stressRating === 3) {
      results.areas.stress.status = 'Moderate';
      results.recommendations.push('Practice regular stress reduction activities like walking in nature, mindfulness, or hobbies you enjoy.');
    } else {
      results.areas.stress.status = 'Good';
    }
    
    // Hydration (Q6)
    switch (answers[5]) {
      case 'less-than-2':
        results.areas.hydration.score = 1;
        results.areas.hydration.status = 'Needs Improvement';
        results.recommendations.push('Increase your water intake gradually to at least 8 glasses per day.');
        break;
      case '2-4':
        results.areas.hydration.score = 2;
        results.areas.hydration.status = 'Needs Improvement';
        results.recommendations.push('Try to drink at least 8 glasses of water daily for proper hydration.');
        break;
      case '5-7':
        results.areas.hydration.score = 4;
        results.areas.hydration.status = 'Moderate';
        results.recommendations.push('You\'re doing well with hydration. Try to reach 8 or more glasses daily.');
        break;
      case '8-plus':
        results.areas.hydration.score = 5;
        results.areas.hydration.status = 'Good';
        break;
    }
    
    // Preventive Care (Q7)
    switch (answers[6]) {
      case 'never':
        results.areas.preventive.score = 1;
        results.areas.preventive.status = 'Needs Improvement';
        results.recommendations.push('Schedule a check-up with a healthcare provider as soon as possible.');
        break;
      case 'more-than-3-years':
        results.areas.preventive.score = 2;
        results.areas.preventive.status = 'Needs Improvement';
        results.recommendations.push('It\'s been over 3 years since your last check-up. Consider scheduling one soon.');
        break;
      case '1-3-years':
        results.areas.preventive.score = 3;
        results.areas.preventive.status = 'Moderate';
        results.recommendations.push('Consider scheduling your next regular check-up if it\'s been close to 2 years.');
        break;
      case 'less-than-1-year':
        results.areas.preventive.score = 5;
        results.areas.preventive.status = 'Good';
        break;
    }
    
    // Calculate overall score (max possible is 35)
    let totalScore = 0;
    Object.keys(results.areas).forEach(area => {
      totalScore += results.areas[area].score;
    });
    
    results.overallScore = totalScore;
    
    // Determine wellness level
    if (totalScore >= 28) {
      results.wellnessLevel = 'Excellent';
      results.recommendations.unshift('Your overall health habits are excellent. Continue your healthy lifestyle and schedule regular check-ups.');
    } else if (totalScore >= 21) {
      results.wellnessLevel = 'Good';
      results.recommendations.unshift('Your overall health habits are good. Focus on the specific areas for improvement identified in this assessment.');
    } else if (totalScore >= 14) {
      results.wellnessLevel = 'Moderate';
      results.recommendations.unshift('Your overall health habits need some improvement. Consider discussing this assessment with a healthcare provider.');
    } else {
      results.wellnessLevel = 'Needs Significant Improvement';
      results.recommendations.unshift('Your overall health habits need significant improvement. We strongly recommend discussing these results with a healthcare provider.');
    }
    
    return results;
  },
  
  // Calculate diabetes risk assessment results
  calculateDiabetesRiskResults: function() {
    const answers = this.currentAssessment.answers;
    let totalScore = 0;
    
    // Map questions to their score values
    const questionScores = this.currentAssessment.questions.map((q, index) => {
      const selectedOption = q.options.find(option => option.value === answers[index]);
      return selectedOption ? (selectedOption.score || 0) : 0;
    });
    
    // Sum up the scores
    totalScore = questionScores.reduce((sum, score) => sum + score, 0);
    
    // Prepare results object
    const results = {
      score: totalScore,
      riskLevel: '',
      explanation: '',
      recommendations: []
    };
    
    // Determine risk level based on score
    if (totalScore <= 3) {
      results.riskLevel = 'Low Risk';
      results.explanation = 'Your results suggest a lower risk of type 2 diabetes based on the factors assessed.';
      results.recommendations = [
        'Maintain a healthy lifestyle with regular physical activity and balanced diet',
        'Continue with regular healthcare check-ups',
        'Learn about the warning signs of diabetes'
      ];
    } else if (totalScore <= 8) {
      results.riskLevel = 'Moderate Risk';
      results.explanation = 'Your results suggest a moderate risk of type 2 diabetes based on the factors assessed.';
      results.recommendations = [
        'Consider speaking with a healthcare provider about your diabetes risk',
        'Aim for at least 30 minutes of physical activity most days',
        'Focus on a diet rich in fruits, vegetables, and whole grains',
        'Maintain a healthy weight or work towards weight loss if needed',
        'Consider getting your blood sugar tested'
      ];
    } else {
      results.riskLevel = 'High Risk';
      results.explanation = 'Your results suggest a higher risk of type 2 diabetes based on the factors assessed.';
      results.recommendations = [
        'Schedule an appointment with a healthcare provider to discuss your diabetes risk',
        'Ask about getting your blood sugar tested',
        'Work with healthcare providers on a plan to reduce risk factors',
        'Aim for 150 minutes of physical activity per week',
        'Consider consulting with a nutritionist for dietary guidance',
        'Monitor for symptoms like increased thirst, frequent urination, or unexplained fatigue'
      ];
    }
    
    // Add disclaimer
    results.disclaimer = 'This assessment provides a general indication of diabetes risk but does not constitute medical advice or diagnosis. Please consult with a healthcare provider for proper evaluation.';
    
    return results;
  },
  
  // Calculate heart health assessment results
  calculateHeartHealthResults: function() {
    const answers = this.currentAssessment.answers;
    
    // This is a simplified heart health evaluation
    const results = {
      riskFactors: [],
      positiveFactors: [],
      overallStatus: '',
      recommendations: []
    };
    
    // Evaluate blood pressure
    if (answers[0] === 'high-stage1' || answers[0] === 'high-stage2') {
      results.riskFactors.push('Elevated blood pressure');
      results.recommendations.push('Work with a healthcare provider to monitor and manage your blood pressure');
    } else if (answers[0] === 'normal') {
      results.positiveFactors.push('Normal blood pressure');
    }
    
    // Evaluate cholesterol
    if (answers[1] === 'high') {
      results.riskFactors.push('High cholesterol');
      results.recommendations.push('Discuss cholesterol management with a healthcare provider');
    } else if (answers[1] === 'normal') {
      results.positiveFactors.push('Healthy cholesterol levels');
    }
    
    // Evaluate smoking
    if (answers[2] === 'current') {
      results.riskFactors.push('Current smoker');
      results.recommendations.push('Quitting smoking is one of the most important steps to improve heart health');
    } else if (answers[2] === 'never') {
      results.positiveFactors.push('Non-smoker');
    } else if (answers[2] === 'former') {
      results.positiveFactors.push('Former smoker (quitting smoking significantly reduces heart disease risk)');
    }
    
    // Evaluate diabetes
    if (answers[3] === 'yes') {
      results.riskFactors.push('Diabetes');
      results.recommendations.push('Continue to work with healthcare providers to manage diabetes');
    } else if (answers[3] === 'prediabetes') {
      results.riskFactors.push('Prediabetes');
      results.recommendations.push('Work with healthcare providers to prevent progression to diabetes');
    }
    
    // Evaluate physical activity
    if (answers[4] === 'rarely') {
      results.riskFactors.push('Limited physical activity');
      results.recommendations.push('Gradually increase physical activity to at least 150 minutes of moderate activity per week');
    } else if (answers[4] === 'regular' || answers[4] === 'frequent') {
      results.positiveFactors.push('Regular physical activity');
    }
    
    // Evaluate family history
    if (answers[5] === 'yes-immediate') {
      results.riskFactors.push('Family history of heart disease (immediate family)');
      results.recommendations.push('Share your family history with your healthcare provider');
    }
    
    // Evaluate diet
    if (answers[6] === 'poor') {
      results.riskFactors.push('Diet high in processed foods, salt, and sugar');
      results.recommendations.push('Gradually transition to a heart-healthy diet with more fruits, vegetables, and whole grains');
    } else if (answers[6] === 'good' || answers[6] === 'excellent') {
      results.positiveFactors.push('Heart-healthy diet');
    }
    
    // Evaluate stress
    if (parseInt(answers[7]) >= 4) {
      results.riskFactors.push('High stress levels');
      results.recommendations.push('Incorporate stress management techniques like meditation, deep breathing, or physical activity');
    }
    
    // Add general recommendations
    results.recommendations.push('Schedule regular check-ups with your healthcare provider');
    results.recommendations.push('Know your numbers (blood pressure, cholesterol, blood sugar)');
    
    // Determine overall status
    if (results.riskFactors.length >= 3) {
      results.overallStatus = 'Multiple heart health risk factors identified';
      results.recommendations.unshift('Consider discussing these risk factors with a healthcare provider');
    } else if (results.riskFactors.length >= 1) {
      results.overallStatus = 'Some heart health risk factors identified';
      results.recommendations.unshift('Consider lifestyle changes to address the identified risk factors');
    } else {
      results.overallStatus = 'Few or no heart health risk factors identified';
      results.recommendations.unshift('Continue your heart-healthy habits');
    }
    
    // Add disclaimer
    results.disclaimer = 'This assessment provides a general indication of heart health factors but does not constitute medical advice or diagnosis. Please consult with a healthcare provider for proper evaluation.';
    
    return results;
  },
  
  // Show assessment results
  showResults: function(results) {
    const assessmentContainer = document.getElementById('assessmentContainer');
    if (!assessmentContainer) return;
    
    let resultsHtml = '';
    
    // Different results display based on assessment type
    switch (this.currentAssessment.id) {
      case 'general-health':
        resultsHtml = this.createGeneralHealthResultsHtml(results);
        break;
      case 'diabetes-risk':
        resultsHtml = this.createDiabetesRiskResultsHtml(results);
        break;
      case 'heart-health':
        resultsHtml = this.createHeartHealthResultsHtml(results);
        break;
      default:
        resultsHtml = '<div class="error">Error displaying results.</div>';
    }
    
    // Create results interface
    const resultsInterface = document.createElement('div');
    resultsInterface.className = 'assessment-results';
    resultsInterface.innerHTML = `
      <div class="results-header">
        <h2>Your ${this.currentAssessment.title} Results</h2>
        <p>Assessment completed ${new Date().toLocaleDateString()}</p>
      </div>
      
      ${resultsHtml}
      
      <div class="disclaimer">
        <p><strong>Important:</strong> This self-assessment is for informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.</p>
      </div>
      
      <div class="results-actions">
        <button id="saveResults" class="btn btn-primary">Save Results</button>
        <button id="restartAssessment" class="btn btn-secondary">Take Another Assessment</button>
      </div>
    `;
    
    assessmentContainer.innerHTML = '';
    assessmentContainer.appendChild(resultsInterface);
    
    // Initialize any charts
    if (this.currentAssessment.id === 'general-health') {
      this.initGeneralHealthChart(results);
    }
    
    // Replace any feather icons
    feather.replace();
  },
  
  // Create HTML for general health results
  createGeneralHealthResultsHtml: function(results) {
    const areaNames = {
      energy: 'Energy Level',
      sleep: 'Sleep Quality',
      nutrition: 'Nutrition',
      exercise: 'Physical Activity',
      stress: 'Stress Management',
      hydration: 'Hydration',
      preventive: 'Preventive Care'
    };
    
    // Create areas list
    const areasHtml = Object.keys(results.areas).map(key => {
      const area = results.areas[key];
      let statusClass = '';
      
      switch (area.status) {
        case 'Needs Improvement':
          statusClass = 'status-needs-improvement';
          break;
        case 'Moderate':
          statusClass = 'status-moderate';
          break;
        case 'Good':
          statusClass = 'status-good';
          break;
      }
      
      return `
        <div class="health-area">
          <div class="area-name">${areaNames[key]}</div>
          <div class="area-status ${statusClass}">${area.status}</div>
        </div>
      `;
    }).join('');
    
    // Create recommendations list
    const recommendationsHtml = results.recommendations.map(rec => 
      `<li>${rec}</li>`
    ).join('');
    
    return `
      <div class="results-overview">
        <div class="results-score">
          <div class="score-circle">
            <span class="score-number">${results.overallScore}</span>
            <span class="score-max">/35</span>
          </div>
          <div class="score-label">Overall Score</div>
        </div>
        
        <div class="results-wellness">
          <h3>Wellness Level: <span class="wellness-level">${results.wellnessLevel}</span></h3>
        </div>
      </div>
      
      <div class="results-chart">
        <canvas id="healthAreasChart"></canvas>
      </div>
      
      <div class="results-areas">
        <h3>Health Areas</h3>
        <div class="areas-grid">
          ${areasHtml}
        </div>
      </div>
      
      <div class="results-recommendations">
        <h3>Recommendations</h3>
        <ul class="recommendations-list">
          ${recommendationsHtml}
        </ul>
      </div>
    `;
  },
  
  // Create HTML for diabetes risk results
  createDiabetesRiskResultsHtml: function(results) {
    // Create recommendations list
    const recommendationsHtml = results.recommendations.map(rec => 
      `<li>${rec}</li>`
    ).join('');
    
    // Determine risk level class for styling
    let riskLevelClass = '';
    switch (results.riskLevel) {
      case 'Low Risk':
        riskLevelClass = 'risk-low';
        break;
      case 'Moderate Risk':
        riskLevelClass = 'risk-moderate';
        break;
      case 'High Risk':
        riskLevelClass = 'risk-high';
        break;
    }
    
    return `
      <div class="results-overview">
        <div class="risk-level ${riskLevelClass}">
          <h3>${results.riskLevel}</h3>
          <p>Score: ${results.score}</p>
        </div>
        
        <div class="risk-explanation">
          <p>${results.explanation}</p>
        </div>
      </div>
      
      <div class="results-recommendations">
        <h3>Recommendations</h3>
        <ul class="recommendations-list">
          ${recommendationsHtml}
        </ul>
      </div>
      
      <div class="results-disclaimer">
        <p>${results.disclaimer}</p>
      </div>
    `;
  },
  
  // Create HTML for heart health results
  createHeartHealthResultsHtml: function(results) {
    // Create risk factors list
    const riskFactorsHtml = results.riskFactors.length > 0 
      ? results.riskFactors.map(factor => `<li>${factor}</li>`).join('')
      : '<li>No major risk factors identified</li>';
    
    // Create positive factors list
    const positiveFactorsHtml = results.positiveFactors.length > 0
      ? results.positiveFactors.map(factor => `<li>${factor}</li>`).join('')
      : '<li>No specific positive factors identified</li>';
    
    // Create recommendations list
    const recommendationsHtml = results.recommendations.map(rec => 
      `<li>${rec}</li>`
    ).join('');
    
    return `
      <div class="results-overview">
        <div class="heart-status">
          <h3>${results.overallStatus}</h3>
        </div>
      </div>
      
      <div class="results-factors">
        <div class="risk-factors">
          <h3>Risk Factors</h3>
          <ul>
            ${riskFactorsHtml}
          </ul>
        </div>
        
        <div class="positive-factors">
          <h3>Positive Factors</h3>
          <ul>
            ${positiveFactorsHtml}
          </ul>
        </div>
      </div>
      
      <div class="results-recommendations">
        <h3>Recommendations</h3>
        <ul class="recommendations-list">
          ${recommendationsHtml}
        </ul>
      </div>
      
      <div class="results-disclaimer">
        <p>${results.disclaimer}</p>
      </div>
    `;
  },
  
  // Initialize chart for general health assessment
  initGeneralHealthChart: function(results) {
    const ctx = document.getElementById('healthAreasChart');
    if (!ctx) return;
    
    const areaNames = {
      energy: 'Energy',
      sleep: 'Sleep',
      nutrition: 'Nutrition',
      exercise: 'Exercise',
      stress: 'Stress Mgmt',
      hydration: 'Hydration',
      preventive: 'Preventive Care'
    };
    
    const areaScores = Object.keys(results.areas).map(key => results.areas[key].score);
    const areaLabels = Object.keys(results.areas).map(key => areaNames[key]);
    
    const chart = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: areaLabels,
        datasets: [{
          label: 'Your Score',
          data: areaScores,
          backgroundColor: 'rgba(74, 111, 220, 0.2)',
          borderColor: 'rgba(74, 111, 220, 1)',
          borderWidth: 2,
          pointBackgroundColor: 'rgba(74, 111, 220, 1)'
        }, {
          label: 'Optimal',
          data: [5, 5, 5, 5, 5, 5, 5],
          backgroundColor: 'rgba(56, 178, 172, 0.1)',
          borderColor: 'rgba(56, 178, 172, 0.6)',
          borderWidth: 1,
          pointBackgroundColor: 'rgba(56, 178, 172, 0.8)'
        }]
      },
      options: {
        scales: {
          r: {
            angleLines: {
              display: true
            },
            suggestedMin: 0,
            suggestedMax: 5
          }
        }
      }
    });
  },
  
  // Save assessment results to localStorage
  saveResults: function() {
    if (!this.currentAssessment) return;
    
    try {
      // Get existing saved assessments or create new array
      const savedAssessments = JSON.parse(localStorage.getItem('health-assessments') || '[]');
      
      // Create new assessment result object
      const assessmentResult = {
        id: Date.now(), // Unique ID based on timestamp
        type: this.currentAssessment.id,
        title: this.currentAssessment.title,
        date: new Date().toISOString(),
        answers: this.currentAssessment.answers,
        results: this.calculateResults()
      };
      
      // Add to saved assessments
      savedAssessments.push(assessmentResult);
      
      // Save back to localStorage
      localStorage.setItem('health-assessments', JSON.stringify(savedAssessments));
      
      HealthAccess.showNotification('Assessment results saved successfully', 'success');
    } catch (error) {
      console.error('Error saving assessment results:', error);
      HealthAccess.showNotification('Error saving assessment results', 'error');
    }
  }
};

// Initialize the health assessment module when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Check if we're on the assessment page
  if (document.getElementById('assessmentContainer')) {
    HealthAssessment.init();
  }
});
