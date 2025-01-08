<script setup lang="ts">
// import nodemailer from 'nodemailer'
import twilio from 'twilio'

const showModal = defineModel('showModal')

const clickedOnce = ref<boolean>(true)

const reqFName = defineModel('reqFName')
const reqLName = defineModel('reqLName')
const reqPhoneNum = defineModel('reqPhoneNum')
const reqEmailAddr = defineModel('reqEmailAddr')
const reqTextArea = defineModel<string>('reqTextArea')

const fieldsFilled = computed(() => {
    return reqFName.value !== undefined && reqPhoneNum.value !== undefined && reqEmailAddr.value !== undefined && reqTextArea.value !== undefined
             && reqFName.value !== '' && reqPhoneNum.value !== '' && reqEmailAddr.value !== '' && reqTextArea.value !== ''
})

// function sendEmail() {

//     const transporter = nodemailer.createTransport({
//             host: "smtp.gmail.com",
//             port: 587,
//             secure: false, // upgrade later with STARTTLS
//             auth: {
//                 user: "dchisholm125@gmail.com",
//                 pass: "uyoe nimg ixnp gfvq",
//             },
//     })

//     const mailOptions = {
//         from: "dchisholm125@gmail.com",
//         to: "dchisholm125@gmail.com",
//         cc: "dchisholm125@gmail.com",
//         subject: "New Housemate Application Received: (" + reqFName.value + (reqLName.value ? ' ' + reqLName.value : '') + ')',
//         text: "Dear Stacey and Derek,\n\n A new application has been received from: " + reqFName.value + (reqLName.value ? ' ' + reqLName.value : '')
//             + "\n\n " + reqTextArea.value,
//         attachments: [
//             {
//             filename: reqFName.value + (reqLName.value ? ' ' + reqLName.value : '') + " - Housemate Application.txt",
//             content: reqTextArea.value,
//             },
//         ],
//     }

//     let successFail = ''

//     transporter.sendMail(mailOptions, (error, info) => {
//         if (error) {
//             console.log('a damn error.....')
//             successFail = error
//         } else {
//             console.log("Email sent: " + info.response)
//             successFail = info.response
//         }
//     })

//     // $fetch('/.netlify/functions/sendReqInfo', {
//     //     query: { 
//     //         applicant: reqFName.value + (reqLName.value ? ' ' + reqLName.value : ''),
//     //         phoneNum: reqPhoneNum.value,
//     //         emailAddr: reqEmailAddr.value,
//     //         text: reqTextArea.value,
//     //     }
//     // })
// }

function sendMsg() {

    const accountSid = 'AC315bfcc9a8fa711ec2e107a5c9912db1';
    const authToken = 'd8b6e8d7091c5ee56b71c481bdb02f0d';
    const client = twilio(accountSid, authToken);
    client.messages
        .create({
            body: 'Dear Stacey, \n\nYou have just received a new request for information from:\n\n\tApplicant Name: ' + reqFName.value + ' ' + reqLName.value + '\n\t' + 'Phone #: ' 
                 + reqPhoneNum.value  + '\n\t' + 'Email Address: ' + reqEmailAddr.value  + '\n\n They have contacted because: \"' + reqTextArea.value + '\"',
            from: '+18446281026',
            to: '+17204468559, '
        })
        .then((message: any) => console.log(message.sid));

    client.messages
        .create({
            body: 'Dear Derek, \n\nYou have just received a new request for information from:\n\n\tApplicant Name: ' + reqFName.value + ' ' + reqLName.value + '\n\t' + 'Phone #: ' 
                 + reqPhoneNum.value  + '\n\t' + 'Email Address: ' + reqEmailAddr.value  + '\n\n They have contacted because: \"' + reqTextArea.value + '\"',
            from: '+18446281026',
            to: '+17204468559, '
        })
        .then((message: any) => console.log(message.sid));

    // $fetch('/.netlify/functions/sendMsg', {
    // query: { msgBody: 'Dear Stacey, \n\nYou have just received a new request for information from:\n\n\tApplicant Name: ' + reqFName.value + ' ' + reqLName.value + '\n\t' + 'Phone #: ' 
    //              + reqPhoneNum.value  + '\n\t' + 'Email Address: ' + reqEmailAddr.value  + '\n\n They have contacted because: \"' + reqTextArea.value + '\"',
    //          phoneNum: '+17204468559'}
    // })

    // $fetch('/.netlify/functions/sendMsg', {
    //     query: { msgBody: 'Dear Derek, \n\nYou have just received a new request for information from:\n\n\tApplicant Name: ' + reqFName.value + ' ' + reqLName.value + '\n\t' + 'Phone #: ' 
    //                 + reqPhoneNum.value  + '\n\t' + 'Email Address: ' + reqEmailAddr.value  + '\n\n They have contacted because: \"' + reqTextArea.value + '\"',
    //             phoneNum: '+17204468559'}
    // })
}

</script>

<template>
    <div class="matte">
        <div class="bd-example-snippet bd-code-snippet">
            <div v-if="clickedOnce" class="bd-example m-0 border-0">
                <h2 class="text-center mb-4">Request Info</h2>
                <h6 class="text-center fst-italic fw-normal">* Please fill out all required fields (highlighted with a <span style="color: red;">red&nbsp;</span>border).</h6>
                <form>
                    <div class="d-flex gap-3 mb-3">
                        <div class="col form-floating mb-3">
                            <input v-model="reqFName" type="text" class="form-control" id="floatingFName" placeholder="John" required>
                            <label for="floatingFName">First Name</label>
                        </div>
                        <div class="col form-floating">
                            <input v-model="reqLName" type="text" class="form-control" id="floatingLName" placeholder="Smith">
                            <label for="floatingLName">Last Name</label>
                        </div>
                    </div>
                    <div class="form-floating">
                            <input v-model="reqPhoneNum" type="number" class="form-control" id="floatingPhoneNum" placeholder="Password" required>
                            <label for="floatingPhoneNum">Phone #</label>
                    </div>
                    <div class="form-floating my-4">
                            <input v-model="reqEmailAddr" type="password" class="form-control" id="floatingEmail" placeholder="Password" required>
                            <label for="floatingEmail">Email Address</label>
                    </div>
                    <div class="form-floating my-4">
                        <textarea v-model="reqTextArea" class="form-control" placeholder="Leave a comment here" id="floatingTextarea" rows="18" style="height: 90%; max-height: 90%;" required></textarea>
                        <label for="floatingTextarea">Let us know how we can help</label>
                    </div>
                    <div class="d-flex gap-2">
                        <!-- <button class="btn btn-danger"@click="sendMsg()" :disabled="!passesBasicCheck">Send to Derek L.</button> -->
                        <button class="btn btn-primary" @click.prevent.stop="clickedOnce = !clickedOnce; sendMsg();" :disabled="!fieldsFilled">Submit</button>
                        <button class="btn btn-dark" @click="showModal = false">Cancel</button>
                    </div>
                </form>
            </div>
            <ThankYouConfirm v-else v-model="showModal"/>
        </div>
    </div>
</template>

<style scoped>
.matte {
    background-color: white;
    width: 80%;
    height: 90vh;
    border-radius: 10px;
    padding: 10px;
    margin: 20px 0;
}

input:invalid, textarea:invalid {
    border-width: 2px;
    border-color: red;
}
</style>