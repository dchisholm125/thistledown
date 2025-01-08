import twilio from 'twilio';

export const handler = async (event) => {
    // return blogs list;
    console.log(getQuery(event).msgBody)

    const accountSid = 'AC315bfcc9a8fa711ec2e107a5c9912db1';
    const authToken = 'd8b6e8d7091c5ee56b71c481bdb02f0d';
    const client = twilio(accountSid, authToken);
    client.messages
        .create({
            body: getQuery(event).msgBody?.toString(),
            from: '+18446281026',
            to: getQuery(event).phoneNum?.toString() + ', '
        })
        .then((message: any) => console.log(message.sid));
  

  return {
        statusCode: 200,
        body: JSON.stringify({
            message: 'Text sent!'
        })
    }
}
