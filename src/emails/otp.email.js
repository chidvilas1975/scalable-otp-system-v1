export const otpEmailTemplate = (otp)=>{

return `

<h2>Your Login OTP</h2>

<p>Your OTP is:</p>

<h1>${otp}</h1>

<p>
   This OTP expires in 5 minutes.
</p>

`;

};