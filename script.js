// Stan aplikacji
let currentStep = 1;

const userSelections = {
    step1: null, // gender
    step2: [],   // grid options
    step3: null, // single option
    step4: null, // situation slider
    step5: null  // frequency slider
};

// Komunikaty dla sliderów
const situationSliderMessages = {
    1: "Bardzo małe zainteresowanie",
    2: "Małe zainteresowanie",
    3: "Średnie zainteresowanie",
    4: "Duże zainteresowanie",
    5: "Bardzo duże zainteresowanie"
};

const frequencySliderMessages = {
    1: "Bardzo rzadko (1 raz w tygodniu)",
    2: "Rzadko (2 razy w tygodniu)",
    3: "Regularnie (3 razy w tygodniu)",
    4: "Często (4-5 razy w tygodniu)",
    5: "Bardzo często (codziennie)"
};

// [NOWE] --- Funkcja walidująca poszczególne kroki ---
function validateStep(stepNumber, userSelections) {
    let isValid = true;
    let errorMessage = '';

    switch (stepNumber) {
        case 2:
            // [NOWE] Przykładowa logika walidacji: 
            // zabroń jednoczesnego wyboru 'opt3' i 'opt4'.
            if (
                userSelections.step2.includes('opt3') &&
                userSelections.step2.includes('opt4')
            ) {
                isValid = false;
                errorMessage = 'Nie można wybrać jednocześnie opcji 3 i 4.';
            }
            break;
        
        // Możesz dodać kolejne warunki dla innych kroków:
        // case 3:
        //   // np. wymagaj wybrania co najmniej jednej opcji...
        //   break;
        
        default:
            // Pozostałe kroki nie mają dodatkowych warunków
            isValid = true;
            errorMessage = '';
            break;
    }

    return { isValid, errorMessage };
}

// Funkcje pomocnicze
function updateFeedback(text) {
    const feedback = document.querySelector('.feedback');
    feedback.textContent = `Wybrano: ${text}`;
    feedback.classList.add('visible');
}

function clearFeedback() {
    const feedback = document.querySelector('.feedback');
    feedback.textContent = '';
    feedback.classList.remove('visible');
}

function updateSliderMessage(slider, value, messages) {
    const messageContainer = slider.closest('.slider-container').querySelector('.slider-message');
    messageContainer.textContent = messages[value];
}

function updateSliderFill(slider) {
    slider.style.setProperty('--value', slider.value);
}

function updateNavigationButtons(step, isValid = false) {
    const nextButton = document.querySelector(`#step${step} .nav-button.next`);
    const prevButton = document.querySelector(`#step${step} .nav-button.prev`);
    
    // Zawsze pokazuj przycisk "wstecz" od kroku 2
    if (prevButton) {
        prevButton.style.visibility = step > 1 ? 'visible' : 'hidden';
    }
    
    // Pokaż przycisk "dalej" tylko gdy wybór jest prawidłowy
    if (nextButton) {
        nextButton.classList.toggle('active', isValid);
    }
}

function restoreSelections(stepId) {
    clearFeedback();
    const step = parseInt(stepId.replace('step', ''));
    
    // Resetuj stan przycisków nawigacji
    updateNavigationButtons(step, false);
    
    if (stepId === 'step1' && userSelections.step1) {
        const button = document.querySelector(`#step1 .image-button[data-option="${userSelections.step1}"]`);
        if (button) {
            button.classList.add('selected');
            updateNavigationButtons(1, true);
            updateFeedback(button.querySelector('h3').textContent);
        }
    }
    
    if (stepId === 'step2' && userSelections.step2.length > 0) {
        userSelections.step2.forEach(id => {
            const button = document.querySelector(`#step2 .select-button[data-view-id="${id}"]`);
            if (button) button.classList.add('selected');
        });
        // [NOWE] Sprawdzamy walidację i ewentualnie wyświetlamy błąd
        const { isValid, errorMessage } = validateStep(2, userSelections);
        updateNavigationButtons(2, isValid);
        
        if (!isValid) {
            updateFeedback(errorMessage);
        } else {
            const selectedTexts = userSelections.step2.map(id => 
                document.querySelector(`#step2 .select-button[data-view-id="${id}"]`).textContent
            ).join(', ');
            updateFeedback(selectedTexts);
        }
    }

    if (stepId === 'step3' && userSelections.step3) {
        const button = document.querySelector(`#step3 .select-button[data-view-id="${userSelections.step3}"]`);
        if (button) {
            button.classList.add('selected');
            updateNavigationButtons(3, true);
            updateFeedback(button.textContent);
        }
    }

    if (stepId === 'step4' && userSelections.step4) {
        const slider = document.getElementById('situationSlider');
        slider.value = userSelections.step4;
        updateSliderFill(slider);
        updateNavigationButtons(4, true);
        updateSliderMessage(slider, userSelections.step4, situationSliderMessages);
    }

    if (stepId === 'step5' && userSelections.step5) {
        const slider = document.getElementById('frequencySlider');
        slider.value = userSelections.step5;
        updateSliderFill(slider);
        updateNavigationButtons(5, true);
        updateSliderMessage(slider, userSelections.step5, frequencySliderMessages);
    }
}

// Event Listeners
// Gender selection (Step 1)
document.querySelectorAll('#step1 .image-button').forEach(button => {
    button.addEventListener('click', () => {
        const wasSelected = button.classList.contains('selected');
        const option = button.getAttribute('data-option');
        
        document.querySelectorAll('#step1 .image-button')
            .forEach(btn => btn.classList.remove('selected'));
        
        if (wasSelected) {
            button.classList.remove('selected');
            userSelections.step1 = null;
            clearFeedback();
            updateNavigationButtons(1, false);
        } else {
            button.classList.add('selected');
            userSelections.step1 = option;
            updateFeedback(button.querySelector('h3').textContent);
            updateNavigationButtons(1, true);
        }
    });
});

// Grid options (Step 2)
document.querySelectorAll('#step2 .select-button').forEach(button => {
    button.addEventListener('click', () => {
        const viewId = button.getAttribute('data-view-id');
        button.classList.toggle('selected');
        
        if (button.classList.contains('selected')) {
            if (!userSelections.step2.includes(viewId)) {
                userSelections.step2.push(viewId);
            }
        } else {
            userSelections.step2 = userSelections.step2.filter(id => id !== viewId);
        }
        
        // [NOWE] Po każdej zmianie sprawdź warunki walidacji dla kroku 2
        const { isValid, errorMessage } = validateStep(2, userSelections);
        updateNavigationButtons(2, userSelections.step2.length > 0 && isValid);
        
        if (!isValid) {
            updateFeedback(errorMessage);
        } else if (userSelections.step2.length > 0) {
            const selectedTexts = Array.from(document.querySelectorAll('#step2 .select-button.selected'))
                .map(btn => btn.textContent)
                .join(', ');
            updateFeedback(selectedTexts);
        } else {
            clearFeedback();
        }
    });
});

// Single option (Step 3)
document.querySelectorAll('#step3 .select-button').forEach(button => {
    button.addEventListener('click', () => {
        const wasSelected = button.classList.contains('selected');
        const viewId = button.getAttribute('data-view-id');
        
        document.querySelectorAll('#step3 .select-button')
            .forEach(btn => btn.classList.remove('selected'));
        
        if (wasSelected) {
            button.classList.remove('selected');
            userSelections.step3 = null;
            clearFeedback();
            updateNavigationButtons(3, false);
        } else {
            button.classList.add('selected');
            userSelections.step3 = viewId;
            updateFeedback(button.textContent);
            updateNavigationButtons(3, true);
        }
    });
});

// Sliders
document.getElementById('situationSlider')?.addEventListener('input', function() {
    updateNavigationButtons(4, true);
    updateSliderMessage(this, this.value, situationSliderMessages);
    updateSliderFill(this);
    userSelections.step4 = this.value;
});

document.getElementById('frequencySlider')?.addEventListener('input', function() {
    updateNavigationButtons(5, true);
    updateSliderMessage(this, this.value, frequencySliderMessages);
    updateSliderFill(this);
    userSelections.step5 = this.value;
});

// Nawigacja (przyciski "prev" / "next")
document.querySelectorAll('.nav-button').forEach(button => {
    button.addEventListener('click', () => {
        const isNext = !button.classList.contains('prev');
        const nextStep = currentStep + (isNext ? 1 : -1);
        
        // Nie wychodzimy poza zakres
        if (nextStep < 1 || nextStep > 6) return;

        // [NOWE] Sprawdź walidację TYLKO gdy idziemy do przodu
        if (isNext) {
            const { isValid, errorMessage } = validateStep(currentStep, userSelections);
            if (!isValid) {
                // Zamiast alertu wyświetlamy w feedback
                updateFeedback(errorMessage);
                return;
            }
        }

        // Przełączenie widoczności kroków
        document.getElementById(`step${currentStep}`).style.display = 'none';
        document.getElementById(`step${nextStep}`).style.display = 'block';
        currentStep = nextStep;
        
        restoreSelections(`step${nextStep}`);
    });
});

// Przyciski akcji (krok 6)
document.getElementById('restartQuiz')?.addEventListener('click', function() {
    Object.keys(userSelections).forEach(key => {
        if (Array.isArray(userSelections[key])) {
            userSelections[key] = [];
        } else {
            userSelections[key] = null;
        }
    });

    document.querySelectorAll('.selected').forEach(el => el.classList.remove('selected'));
    document.querySelectorAll('.custom-slider').forEach(slider => {
        slider.value = 3;
        updateSliderFill(slider);
    });
    document.querySelectorAll('.slider-message').forEach(msg => msg.textContent = '');
    
    document.querySelectorAll('.step').forEach(step => step.style.display = 'none');
    document.getElementById('step1').style.display = 'block';
    currentStep = 1;
    
    clearFeedback();
});

document.getElementById('sendEmail')?.addEventListener('click', function() {
    alert('Funkcja wysyłania maila zostanie zaimplementowana wkrótce.');
});

// Inicjalizacja
clearFeedback();
document.querySelectorAll('.custom-slider').forEach(slider => {
    updateSliderFill(slider);
    if (slider.id === 'situationSlider') {
        updateSliderMessage(slider, slider.value, situationSliderMessages);
    } else if (slider.id === 'frequencySlider') {
        updateSliderMessage(slider, slider.value, frequencySliderMessages);
    }
});
