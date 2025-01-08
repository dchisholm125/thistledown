<script setup lang="ts">
import Bike from '@/assets/bicycle-3-svgrepo-com.svg'
import CableTV from '@/assets/wifi-svgrepo-com.svg'
import Bathroom from '@/assets/Full Bathroom.svg'
import Kitchen from '@/assets/full kitchen.svg'
import OutdoorSpace from '@/assets/Outdoor communal space.svg'
import Beds from '@/assets/Twin Bed.svg'
import WasherDryer from '@/assets/Washer and Dryer On-site.svg'
import Parking from '@/assets/parking-svgrepo-com.svg'
import SingleDouble from '@/assets/Single and double.svg'

import AboutUsPhoto from '@/assets/AboutUsPhoto.jpeg'
import HouseAmenPhoto from '@/assets/House Amenities.jpeg'
import MissionPhoto from '@/assets/Our Mission.jpeg'
import HomePhoto from '@/assets/Our Home.jpeg'
import CommunityPhoto from '@/assets/north_conway.jpg'
import ApproachPhoto from '@/assets/Our Approach.jpeg'

const showModal = defineModel()
const caller = inject('caller')

const contentSections = ref([
    {
        sectionName: "About Us",
        sectionContent: "Welcome to Thistledown Recovery Home, a dedicated sober living "
                    + "environment for men who are committed to transforming their lives and "
                    + "embracing sobriety. Our home is designed to provide a supportive and "
                    + "structured living space that fosters personal growth, accountability, and a "
                    + "sense of community among residents who are on a shared journey towards "
                    + "lasting recovery.",
        imgSrc: AboutUsPhoto,
    },
    {
        sectionName: "Our Mission",
        sectionContent: "At Thistledown Recovery Home, our mission is to offer a safe and stable "
                    + "residence for men who have made a conscious decision to stay sober. We "
                    + "understand that the path to recovery is unique for each individual, and we "
                    + "believe that a supportive home environment is crucial to maintaining "
                    + "sobriety. Our goal is to facilitate a space where residents can focus on their "
                    + "recovery without the distractions and triggers of their previous living "
                    + "situations.",
        imgSrc: MissionPhoto,
    },
    {
        sectionName: "Our Home",
        sectionContent: "Located in Conway, New Hampshire, our sober home is situated in a "
                        + "peaceful and welcoming community. The residence features comfortable "
                        + "living quarters, communal spaces for fellowship and relaxation, and "
                        + "amenities that cater to the needs of our residents. We take pride in "
                        + "maintaining a clean and orderly home to ensure a conducive atmosphere "
                        + "for recovery.",
        imgSrc: HomePhoto,
        boldCallout: "CONWAY, NH", 
    },
    {
        sectionName: "Our Community",
        sectionContent: "Thistledown is situated in a vibrant community, surrounded by a plethora of "
                        + "diverse businesses. Its convenient location offers residents the unique "
                        + "advantage of being within walking distance or a short commute to a wide "
                        + "range of employment opportunities. Residents are permitted to store "
                        + "personal bicycles on property and a local taxi service is available for "
                        + "transportation needs, ensuring everyone has easy access to reliable travel "
                        + "to and from their place of employment.",
        imgSrc: CommunityPhoto,
    },
    {
        sectionName: "Our Approach",
        sectionContent: "While we do not offer treatment services, our sober home operates with "
                        + "guidelines that encourage a sober lifestyle. We require that all residents "
                        + "commit to staying drug and alcohol-free, actively participate in their "
                        + "personal recovery plans, and support one another in their journey. Our "
                        + "house rules are designed to promote respect, responsibility, and personal "
                        + "growth.\n\t"
                        + "\n\t"
                        + "Residents are encouraged to engage with external recovery programs, "
                        + "attend meetings, and seek out the resources they need to support their "
                        + "sobriety. We believe in the power of community and peer support, and our "
                        + "home serves as a foundation from which residents can build a fulfilling and "
                        + "sober life.",
        imgSrc: ApproachPhoto,
    },
])

</script>

<template>
    <div class="d-flex flex-column bg-thistle-ultralight-grey">
        <ContentBlock v-for="(section, index) in contentSections" 
            :key="section.sectionName"
            :imgAfterText="index % 2 > 0"
            :sectionName="section.sectionName"
            :sectionContent="section.sectionContent"
            :imgSrc="section.imgSrc"
            :boldCallout="section.boldCallout"
                />

        <ContentBlock :imgAfterText="true" :imgSrc="HouseAmenPhoto" sectionName="House Amenities">

            <div class="d-flex flex-column">
                <hr />
                <div class="d-flex align-self-center w-100">
                    <div class="col d-flex flex-column">
                        <div class="col">
                            <AmenityCard :icon="SingleDouble" text="Single and double occupancy bedrooms"/>
                        </div>
                        <div class="col">
                            <AmenityCard :icon="Beds" text="Twin bed, bedding, and personal dresser"/>
                        </div>
                        <div class="col">
                            <AmenityCard :icon="WasherDryer" text="Washer and dryer on-site"/>
                        </div>
                        <div class="col">
                            <AmenityCard :icon="CableTV" text="Cable television, free wi-fi"/>
                        </div>
                        <div class="col">
                            <AmenityCard :icon="Parking" text="Parking on-site"/>
                        </div>
                    </div>
                    <div class="col d-flex flex-column">
                        <div class="col">
                            <AmenityCard :icon="Kitchen" text="Full kitchen and multiple refrigerators"/>
                        </div>
                        <div class="col">
                            <AmenityCard :icon="Bathroom" text="3 full bathrooms"/>
                        </div>
                        <div class="col">
                            <AmenityCard :icon="OutdoorSpace" text="Outdoor communal space and smoking area"/>
                        </div>
                        <div class="col">
                            <AmenityCard :icon="Bike" text="Storage space for bicycles or motor vehicles"/>
                        </div>
                        <div class="col">
                            <!-- intentionally empty for symmetry -->
                        </div>
                    </div>
                </div>
            </div>
        </ContentBlock>
    
        <hr class="mx-4"/>

        <div class="container col-xxl-8 px-4 py-5">
            <div class="row flex-lg-row-reverse align-items-center g-5 py-5">
                <div class="col justify-content-center text-center">
                    <h1 id="join-us" class="display-5 fw-bold text-body-emphasis lh-1 mb-3">Join Us</h1>
                    <p class="lead">If you or a loved one is seeking a men's sober living home that prioritizes a
                        sober and supportive living environment, Thistledown Recovery Home may
                        be the right fit. We invite you to learn more about our home and how we
                        can be a part of your recovery journey. Please contact us for more
                        information or to schedule a visit.</p>
                    <div class="d-lg-flex d-none justify-content-center">
                        <button type="button" class="btn btn-primary btn-lg px-4 me-md-2" @click="showModal = !showModal; caller = 'info';">Request Info</button>
                        <button type="button" class="btn btn-success btn-lg px-4" @click="showModal = !showModal; caller = 'apply';">Apply Now!</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>

li {
    padding: 5px;
}

.animate:hover{
    animation: 0.5s linear fadeIn;
    color: blue;
    background-color: rgba(0, 0, 0, 0.048);
    border-radius: 10px;
    font-size: 19pt;
}
</style>