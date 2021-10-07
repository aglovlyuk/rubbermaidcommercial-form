let currentTab = 0;
const tabs = document.getElementsByClassName("js-form-slide");
const tabsNav = document.querySelector(".js-form-nav");
const formCta = document.querySelector(".js-form-cta");

/*showTab(currentTab);*/

function showForm() {
    showTab(currentTab);
    formCta.classList.add("is-hidden");
    tabsNav.classList.remove("is-hidden");
}

function showTab(n) {
    // display the specified tab
    let nextBtn = document.getElementsByClassName("js-next-btn");

    tabs[n].style.display = "block";

    if (n === (tabs.length - 1)) {
        nextBtn[0].innerHTML = "My savings";
    }
    // display correct step indicator:
    fixStepIndicator(n)
}

function nextPrev(n) {
    if (n === 1 && !validateForm()) return false;
    tabs[currentTab].style.display = "none";
    currentTab = currentTab + n;

    // end of the form:
    if (currentTab >= tabs.length) {
        document.querySelector(".audit-form").submit();
        return false;
    }

    if (currentTab > 0) {
        tabsNav.classList.remove("is-hidden");
    }

    showTab(currentTab);
}

function validateForm() {
    // validation form fields:
    let fields, i, message, valid = true;
    fields = tabs[currentTab].getElementsByTagName("input");
    message = tabs[currentTab].querySelector(".validation-message");

    // check every field in the current tab:
    for (i = 0; i < fields.length; i++) {
        for (const field of fields) {
            if (field.type === "checkbox" || field.type === "radio") {
                if(field.checked) {
                    valid = true;
                    break;
                }

                else {
                    message.classList.remove("is-hidden");
                    valid = false;
                }
            }
        }

        if (fields[i].value === "") {
            message.classList.remove("is-hidden");
            fields[i].className += " invalid";
            valid = false;
        }
    }
    // valid -- mark the step as finished:
    if (valid) {
        document.getElementsByClassName("js-step-indicator")[currentTab].className += " finish";
    }
    return valid;
}

function fixStepIndicator(n) {
    let currentStep = document.querySelector(".js-current-step");
    let totalStep = document.querySelector(".js-total-step");
    let steps = document.getElementsByClassName("js-step-indicator");

    for (let i = 0; i < steps.length; i++) {
        steps[i].className = steps[i].className.replace(" is-active", "");
    }

    // adds the "is-active" class to the current step:
    steps[n].className += " is-active";
    totalStep.innerHTML = steps.length;
    currentStep.innerHTML = n + 1;
}

function rangeSlider() {
    let sliders = document.getElementsByClassName("audit-slider");

    for (let i = 0; i < sliders.length; i++) {
        let rangeSlider = sliders[i].querySelector("input[type='range']");
        let rangeValueTxt = sliders[i].querySelector(".audit-slider__range");

        rangeValueTxt.innerHTML = rangeSlider.value;

        rangeSlider.oninput = function() {
            rangeValueTxt.innerHTML = this.value;
        }
    }
}

rangeSlider();
