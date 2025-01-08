<script setup lang="ts">
import { ref } from 'vue'

const showModal = defineModel('showModal')

const clickedOnce = ref<boolean>(true)

const applicantName = defineModel<string>('applicantName')
const todaysDate = ref<Date>(new Date(Date.now()))
const applicantAddr = defineModel<string>('applicantAddr')
const applicantEmailAddr = defineModel<string>('applicantEmailAddr')
const applicantPhoneNum = defineModel<string>('applicantPhoneNum')
const applicantDOB = defineModel<Date>('applicantDOB')
const appContactAndPhone = defineModel<string>('appContactAndPhone')
const applicantNextOfKin = defineModel<string>('applicantNextOfKin')
const applicantHearOfUs = defineModel<string>('applicantHearOfUs')
const applicantProgram = defineModel<string>('applicantProgram')
const applicantAdmitDate = defineModel<string>('applicantAdmitDate')
const applicantSupervisor = defineModel<string>('applicantSupervisor')
const appSupeEmail = defineModel<string>('appSupeEmail')
const appSupePhone = defineModel<string>('appSupePhone')
const appLeaveHome = defineModel<boolean>('appLeaveHome')
const appLeaveReason = defineModel<string>('appLeaveReason')
const appEvicted = defineModel<boolean>('appEvicted')
const appEvictWhy = defineModel<string>('appEvictWhy')
const appLastUse = defineModel<string>('appLastUse')
const appWarrants = defineModel<string>('appWarrants')
const appProbation = defineModel<string>('appProbation')
const appSexOffend = defineModel<boolean>('appSexOffend')
const appViolence = defineModel<boolean>('appViolence')
const appViolenceExplain = defineModel<string>('appViolenceExplain')
const appRestrOrder = defineModel<boolean>('appRestrOrder')
const appRestrExplain = defineModel<string>('appRestrExplain')
const appTreatment = defineModel<boolean>('appTreatment')
const appTreatProvNamePhone = defineModel<string>('appTreatProvNamePhone')
const appMedication = defineModel<string>('appMedication')
const appAllergies = defineModel<boolean>('appAllergies')
const appAllergiesExplain = defineModel<string>('appAllergiesExplain')
const appInhaler = defineModel<boolean>('appInhaler')
const appInhalerExplain = defineModel<string>('appInhalerExplain')
const appMedConditions = defineModel<string>('appMedConditions')
const appMentalConditions = defineModel<string>('appMentalConditions')
const appCovidVacc = defineModel<boolean>('appCovidVacc')
const appCovidWilling = defineModel<boolean>('appCovidWilling')
const appMedicalIns = defineModel<boolean>('appMedicalIns')
const appPolicyNameNum = defineModel<string>('appPolicyNameNum')
const applicantMarriage = defineModel<string>('applicantMarriage')
const applicantChildren = defineModel<string>('applicantChildren')
const appEmployment = defineModel<string>('appEmployment')
const appDriverLic = defineModel<boolean>('appDriverLic')
const appParking = defineModel<boolean>('appParking')
const appCarLicNum = defineModel<string>('appCarLicNum')
const appMakeModel= defineModel<string>('appMakeModel')
const appRecoveryQues = defineModel<string>('appRecoveryQues')
const appHowWeHelp = defineModel<string>('appHowWeHelp')
const applicantQualities = defineModel<string>('applicantQualities')
const appTroubleWRules = defineModel<string>('appTroubleWRules')
const appCharacteristics = defineModel<string[]>('appCharacteristics') //make array of choices
const appCharOther = defineModel<string>('appCharOther')
const commChars = ['temper','social awkwardness','anxiety','arrogance','bullying','sarcasm','need for control','shyness','tendency to lie','defiance','mistrust of other men','not \'fitting in\'']
const appReservations = defineModel<string>('appReservations')
const appWhatShouldWeKnow = defineModel<string>('appWhatShouldWeKnow')

const commCharChoices = ref<string[]>([])

const applicationObj = computed(() => {
    return {
        'Name': applicantName.value,
        'Date': todaysDate.value.toDateString(),
        'Address': applicantAddr.value,
        'Phone #': applicantPhoneNum.value,
        'Date of Birth': applicantDOB.value,
        'Email Address': applicantEmailAddr.value,
        'Emergency Contact and Phone': appContactAndPhone.value,
        'Next of kin, if different': applicantNextOfKin.value,
        'How did you hear about us?': applicantHearOfUs.value,
        'Name of program or facility': applicantProgram.value,
        'Date you arrived or were admitted': applicantAdmitDate.value,
        'Aftercare coordinator or DOC supervisor': applicantSupervisor.value,
        'Coordinator/Supervisor Email address': appSupeEmail.value,
        'Coordinator/Supervisor Phone #': appSupePhone.value,
        'Have you ever been asked to leave a sober house or treatment center?': appLeaveHome.value,
        'If so, what was the reason?': appLeaveReason.value,
        'Have you ever been evicted?': appEvicted.value,
        'If so, why?': appEvictWhy.value,
        'When did you last use alcohol or illegal drugs?': appLastUse.value,
        'Do you have any outstanding warrants, pending criminal charges or upcoming court dates?': appWarrants.value,
        'Are you on probation, parole, or suspended sentence? Please explain': appProbation.value,
        'Are you a convicted sex offender and/or required to register as a sex offender in any state?': appSexOffend.value,
        'Do you have a history of violence?': appViolence.value,
        'Please explain history': appViolenceExplain.value,
        'Are you currently subject to an order of protection (restraining order) by the court?': appRestrOrder.value,
        'Please explain order of protection': appRestrExplain.value,
        'Are you undergoing medication assisted treatment (MAT/MAR) such as methadone or suboxone?': appTreatment.value,
        'Provider name and contact information': appTreatProvNamePhone.value,
        'Please list any physician-prescribed medication': appMedication.value,
        'Do you have any allergies?': appAllergies.value,
        'If so, please list your them': appAllergiesExplain.value,
        'Do you use a rescue inhaler or Epipen?': appInhaler.value,
        'If so, please tell us more': appInhalerExplain.value,
        'Other than alcoholism and/or addiction, do you have any medical conditions or physical disabilities we should be aware of?': appMedConditions.value,
        'Other than alcoholism and/or addiction, do you have any mental health issues or disabilities we should be aware of?': appMentalConditions.value,
        'Have you been vaccinated against COVID-19?': appCovidVacc.value,
        'Are you willing to be vaccinated?': appCovidWilling.value,
        'Do you have medical insurance (in case of medical emergency)?': appMedicalIns.value,
        'Policy name/number': appPolicyNameNum.value,
        'Marital Status': applicantMarriage.value,
        'Children?': applicantChildren.value,
        'Please tell us about your current employment/volunteer/student status (where/hours/supervisor, etc.)': appEmployment.value,
        'Do you have a valid driver’s license?': appDriverLic.value,
        'Will you need parking?': appParking.value,
        'If so, license number and state': appCarLicNum.value,
        'Make/Model/VIN': appMakeModel.value,
        'What is the biggest challenge you face in sustaining your recovery?': appRecoveryQues.value,
        'How do you expect being a part of our home will help with your recovery?': appHowWeHelp.value,
        'What personal qualities will you contribute to the mutual support we share in our home?': applicantQualities.value,
        'Is there any reason you might have trouble following our home’s guidelines and expectations?': appTroubleWRules.value,
        'Following is a short list of characteristics that can possibly make communal living difficult. Do any of these describe parts of your personality?': commCharChoices.value,
        'Other': appCharOther.value,
        'What reservations/reluctance do you have about following the house rules, policies, and procedures?': appReservations.value,
        'Is there anything else you think we should know about you? Thistledown will consider all reasonable accommodations for residency': appWhatShouldWeKnow.value,
    }
})

function addRemove(commChar: string) {
    commCharChoices.value.indexOf(commChar) < 0 ? commCharChoices.value.push(commChar) : commCharChoices.value.splice(commCharChoices.value.indexOf(commChar),1)
}

function sendMsg() {

    let initialStr = 'You have just received a new a Housemate Application:\n\n\tApplicant Name: ' + applicantName.value + '\n\t' + 'Phone #: ' 
                     + applicantPhoneNum.value  + '\n\t' + 'Email Address: ' + applicantEmailAddr.value

    //IF they are there, give them this.
    let coordStr = appSupeEmail.value || appSupePhone.value ? '\n\tCoordinator Email/Phone: ' + appSupeEmail.value + '/' + appSupePhone.value : '' 

    useFetch('/.netlify/functions/sendMsg', {
        query: { msgBody: "Dear Stacey,\n\n" + initialStr + coordStr, phoneNum: '+17204468559'}
    })

    useFetch('/.netlify/functions/sendMsg', {
        query: { msgBody: "Dear Derek,\n\n" + initialStr + coordStr, phoneNum: '+17204468559'}
    })
}

function sendEmail() {
    let strBuilder = ''

    let entryArr = Object.entries(applicationObj.value)

    entryArr.forEach(entry => strBuilder += entry[0] + ': ' + entry[1] + '\n')

    console.log(strBuilder)

    $fetch('/.netlify/functions/sendEmail', {
        query: { 
            applicant: applicantName.value, 
            text: strBuilder,
        }
    })
}

const fieldsFilled = computed(() => {
    return (applicantName.value !== undefined && applicantName.value !== '') &&
    (applicantEmailAddr.value !== undefined && applicantEmailAddr.value !== '') &&
    (applicantPhoneNum.value !== undefined && applicantPhoneNum.value !== '') &&
    (applicantDOB.value !== undefined && applicantDOB.value !== null) &&
    (applicantHearOfUs.value !== undefined && applicantHearOfUs.value !== '') &&
    (applicantProgram.value !== undefined && applicantProgram.value !== '') &&
    (appLeaveHome.value !== undefined && appLeaveHome.value !== null) &&
    (appEvicted.value !== undefined && appEvicted.value !== null) &&
    (appLastUse.value !== undefined && appLastUse.value !== '') &&
    (appWarrants.value !== undefined && appWarrants.value !== '') &&
    (appProbation.value !== undefined && appProbation.value !== '') &&
    (appSexOffend.value !== undefined && appSexOffend.value !== null) &&
    (appViolence.value !== undefined && appViolence.value !== null) &&
    (appRestrOrder.value !== undefined && appRestrOrder.value !== null) &&
    (appTreatment.value !== undefined && appTreatment.value !== null) &&
    (appAllergies.value !== undefined && appAllergies.value !== null) &&
    (appInhaler.value !== undefined && appInhaler.value !== null) &&
    (appMedConditions.value !== undefined && appMedConditions.value !== '') &&
    (appMentalConditions.value !== undefined && appMentalConditions.value !== '') &&
    (appMedicalIns.value !== undefined && appMedicalIns.value !== null) &&
    (appDriverLic.value !== undefined && appDriverLic.value !== null) &&
    (appParking.value !== undefined && appParking.value !== null) &&
    (appRecoveryQues.value !== undefined && appRecoveryQues.value !== '') &&
    (appHowWeHelp.value !== undefined && appHowWeHelp.value !== '') &&
    (applicantQualities.value !== undefined && applicantQualities.value !== '') &&
    (appReservations.value !== undefined && appReservations.value !== '') &&
    (appWhatShouldWeKnow.value !== undefined && appWhatShouldWeKnow.value !== '') &&
    (commCharChoices.value.length > 0 || ( appCharOther.value !== undefined && appCharOther.value !== null))
})

</script>

<template>
    <div v-if="clickedOnce" class="ms-4 pe-4 py-4 overflow-y-auto">
        <h2 class="text-center mb-4">New Housemate Application</h2>
        <h6 class="text-center fst-italic fw-normal">* Please fill out all required fields (highlighted with a <span style="color: red;">red&nbsp;</span>border). We ask that you do your best to fill out all fields.</h6>
        <form class="bg-white p-4 border border-solid rounded" id="printarea">
            <div class="d-flex justify-content-around gap-2">
                <div class="col mb-3">
                    <label for="nameInput" class="form-label">Name</label>
                    <input v-model="applicantName" type="text" class="form-control" id="nameInput" aria-describedby="nameHelp" required >
                    <!-- <div id="nameHelp" class="form-text">We'll never share your email with anyone else.</div> -->
                </div>
                <div class="col mb-3">
                    <label for="dateInput" class="form-label">Date</label>
                    <input type="text" class="form-control" id="dateInput" :value="(todaysDate.getMonth() + 1) + '/' + todaysDate.getDate() + '/' + todaysDate.getFullYear()" disabled>
                </div>
            </div>
            <div class="col mb-3">
                <label for="addrInput" class="form-label">Address</label>
                <input v-model="applicantAddr" type="text" class="form-control" id="addrInput">

            </div>
            <div class="d-flex justify-content-around gap-2">
                <InputAndLabel v-model="applicantPhoneNum" class="col" labelStr="Phone Number" inputType="text"/>
                <InputAndLabel v-model="applicantDOB" class="col" labelStr="Date of Birth" inputType="date"/>
            </div>

            <div class="col mb-3">
                <label for="emailAddrInput" class="form-label">Email Address</label>
                <input v-model="applicantEmailAddr" type="email" class="form-control" id="emailAddrInput" required >
            </div>

            <InputAndLabel v-model="appContactAndPhone" labelStr="Emergency Contact and Phone" inputType="textarea" notRequired />
            <InputAndLabel v-model="applicantNextOfKin" labelStr="Next of kin, if different" inputType="text" notRequired/>
            <InputAndLabel v-model="applicantHearOfUs" labelStr="How did you hear about us?" inputType="textarea"/>
            <InputAndLabel v-model="applicantProgram" labelStr="Name of program or facility" inputType="text"/>
            <InputAndLabel v-model="applicantAdmitDate" labelStr="Date you arrived or were admitted" inputType="date" notRequired/>
            <InputAndLabel v-model="applicantSupervisor" labelStr="Aftercare coordinator or DOC supervisor" inputType="text" notRequired/>

            <div class="d-flex justify-content-around gap-2">
                <InputAndLabel v-model="appSupeEmail" class="col" labelStr="Email address" inputType="text" notRequired/>
                <InputAndLabel v-model="appSupePhone"class="col" labelStr="Phone" inputType="text" notRequired/>
            </div>

            <InputAndLabel v-model="appLeaveHome" labelStr="Have you ever been asked to leave a sober house or treatment center?" inputType="radio"/>
            <InputAndLabel v-if="appLeaveHome" v-model="appLeaveReason" labelStr="If so, what was the reason?" inputType="text"/>
            <InputAndLabel v-model="appEvicted" labelStr="Have you ever been evicted?" inputType="radio"/>
            <InputAndLabel v-if="appEvicted" v-model="appEvictWhy" labelStr="If so, why?" inputType="text"/>
            <InputAndLabel v-model="appLastUse" labelStr="When did you last use alcohol or illegal drugs?" inputType="text"/>
            <InputAndLabel v-model="appWarrants" labelStr="Do you have any outstanding warrants, pending criminal charges or upcoming court dates?" 
                inputType="text"/>
            <InputAndLabel v-model="appProbation" labelStr="Are you on probation, parole, or suspended sentence? Please explain" inputType="text"/>
            <InputAndLabel v-model="appSexOffend" labelStr="Are you a convicted sex offender and/or required to register as a sex offender in any state?" 
                inputType="radio"/>
            <InputAndLabel v-model="appViolence" labelStr="Do you have a history of violence?" inputType="radio"/>
            <InputAndLabel v-if="appViolence" v-model="appViolenceExplain" labelStr="Please explain" inputType="text"/>
            <InputAndLabel v-model="appRestrOrder" labelStr="Are you currently subject to an order of protection (restraining order) by the court?" 
                inputType="radio"/>
            <InputAndLabel v-if="appRestrOrder" v-model="appRestrExplain" labelStr="Please explain" inputType="text"/>
            <InputAndLabel v-model="appTreatment" labelStr="Are you undergoing medication assisted treatment (MAT/MAR) such as methadone or suboxone?" 
                inputType="radio"/>
            <InputAndLabel v-model="appTreatProvNamePhone" labelStr="Provider name and contact information" 
                inputType="text" notRequired/>
            <InputAndLabel v-model="appMedication" labelStr="Please list any physician-prescribed medication" 
                inputType="text" notRequired/>
                <!-- change to radio buttons -->
            <InputAndLabel v-model="appAllergies" labelStr="Do you have any allergies?" inputType="radio"/>
            <InputAndLabel v-if="appAllergies" v-model="appAllergiesExplain" labelStr="If so, please list them." inputType="text"/>
            <InputAndLabel v-model="appInhaler" labelStr="Do you use a rescue inhaler or Epipen?" inputType="radio"/>
            <InputAndLabel v-if="appInhaler" v-model="appInhalerExplain" labelStr="If so, please let us know more." inputType="text"/>
                <!-- change to radio buttons -->
            <InputAndLabel v-model="appMedConditions" labelStr="Other than alcoholism and/or addiction, do you have any medical
                conditions or physical disabilities we should be aware of?" inputType="text"/>
            <InputAndLabel v-model="appMentalConditions" labelStr="Other than alcoholism and/or addiction, do you have any mental health
                issues or disabilities we should be aware of?" inputType="text"/>
            <InputAndLabel v-model="appCovidVacc" labelStr="Have you been vaccinated against COVID-19?" inputType="radio" notRequired/>
            <InputAndLabel v-if="!appCovidVacc" v-model="appCovidWilling" labelStr="Are you willing to be vaccinated?" inputType="radio" notRequired/>
            <InputAndLabel v-model="appMedicalIns" labelStr="Do you have medical insurance (in case of medical emergency)?" inputType="radio"/>
            <InputAndLabel v-if="appMedicalIns" v-model="appPolicyNameNum" labelStr="Policy name/number" inputType="text" notRequired/>

            <h5>General Information:</h5>
            
            <div class="d-flex justify-content-around gap-2">
                <InputAndLabel v-model="applicantMarriage" class="col" labelStr="Marital Status" inputType="text" notRequired/>
                <InputAndLabel v-model="applicantChildren" class="col" labelStr="Children?" inputType="text" notRequired/>
            </div>
            <InputAndLabel v-model="appEmployment" labelStr="Please tell us about your current employment/volunteer/student status
                (where/hours/supervisor, etc.)" inputType="textarea" notRequired/>
                <InputAndLabel v-model="appDriverLic" :labelStr="'Do you have a valid driver\’s license?'" inputType="radio"/>
            <InputAndLabel v-model="appParking" labelStr="Will you need parking?" inputType="radio"/>
            <InputAndLabel v-if="appParking" v-model="appCarLicNum" labelStr="If so, please let us know your license plate number and state" inputType="text" notRequired/>
            <InputAndLabel v-if="appParking" v-model="appMakeModel" labelStr="Make/Model/VIN" inputType="text" notRequired/>
            <InputAndLabel v-model="appRecoveryQues" labelStr="What is the biggest challenge you face in sustaining your recovery?" inputType="textarea"/>
            <InputAndLabel v-model="appHowWeHelp" labelStr="How do you expect being a part of our home will help with your recovery?" inputType="textarea"/>
            <InputAndLabel v-model="applicantQualities" labelStr="What personal qualities will you contribute to the mutual support we share in our home?" 
                inputType="textarea"/>
            <InputAndLabel v-model="appTroubleWRules" :labelStr="'Is there any reason you might have trouble following our home\’s guidelines and expectations?'" 
                inputType="textarea"/>

            <div>
                <label class="col mb-3" for="appCharacteristics">Following is a short list of characteristics that can possibly make communal
                    living difficult. Do any of these describe parts of your personality?</label>
                <div class="d-flex flex-wrap">
                    <div v-for="(commChar, cIndex) in commChars" class="ms-2 mb-3 form-check">
                        <input type="checkbox" class="form-check-input" 
                            :value="commChar" :id="commChar" @click="addRemove(commChar)">
                        <label class="form-check-label" :for="commChar">{{ commChar }}</label>
                    </div>
                    <InputAndLabel v-model="appCharOther" class="d-flex align-items-center mx-2 gap-2" labelStr="Other:" inputType="text" :notRequired="commCharChoices.length > 0"/>
                </div>
            </div>

            <InputAndLabel v-model="appReservations" labelStr="What reservations/reluctance do you have about following the house rules, policies, 
                and procedures?" inputType="textarea"/>
            <InputAndLabel v-model="appWhatShouldWeKnow" labelStr="Is there anything else you think we should know about you? Thistledown will
                consider all reasonable accommodations for residency" inputType="textarea"/>

            <div class="d-flex gap-2">
                <!-- <button class="btn btn-danger"@click="sendMsg()" :disabled="!passesBasicCheck">Send to Derek L.</button> -->
                <button type="submit" class="btn btn-primary" @click.prevent="clickedOnce = !clickedOnce; sendEmail(); sendMsg()" :disabled="!fieldsFilled">Submit</button>
                <button class="btn btn-dark" @click="showModal = false">Cancel</button>
            </div>
        </form>
    </div>
    <ThankYouConfirm v-else v-model="showModal"/>
</template>

<style scoped>
input:invalid{
    border-width: 2px;
    border-color: red;
}
</style>
