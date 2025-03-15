
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors")({origin: true});
const app = express();
admin.initializeApp();
const OpenAI = require("openai");
const { UserRecordMetadata } = require("firebase-functions/v1/auth");
app.use(express.json({limit: "50mb"}))
app.use(cors);
const openAIAPIKey = functions.config().socialmedia.openaikey;
const openai = new OpenAI({
    apiKey: openAIAPIKey,
  });
const bucket = admin.storage().bucket();
async function uploadFile({base64FileString, filename, contentType}) {
    try {
        const fileBuffer = Buffer.from(base64FileString, "base64");
        const file = bucket.file(filename);
        await file.save(fileBuffer, {
          metadata: {
            contentType: contentType,
            cacheControl: "public, max-age=31536000",
          },
        });
        await file.makePublic();
      }
     catch (error) {
      console.error("Error uploading base64 files:", error);
      
    }
  }
  async function fetchAboutUsData(domain) {
    const urls = [
      `https://${domain}/about-us`,
      `https://${domain}/about`,
      `https://${domain}/our-story`,
      `https://${domain}/company`,
      `https://${domain}/who-we-are`,
    ];
  
    for (const url of urls) {
      try {
        const response = await fetch(url);
        if (response.ok) {
          return await response.text();
        }
      } catch (error) {
        console.error(`Failed to fetch: ${url}`);
      }
    }
    return null;
  }
  
  /**
   * Generate Company Data using ChatGPT
   */
  async function generateCompanyData(domain, email) {
    try {
      // First API call
      const firstResponse = await fetch(`https://hook.us2.make.com/hq4rboy9yg0pxnsh7mb2ri9vj4orsj0m?clientWebsite=${domain}&username=${email}`);
      
     
  
      // Parse first response (if needed, depending on API response format)
      const firstData = await firstResponse.json();
      await new Promise(resolve => setTimeout(resolve, 3000));
      // Second API call
      const secondResponse = await fetch(`https://hook.us2.make.com/yljp8ebfpmyb7qxusmkxmh89cx3dt5zo?clientWebsite=${domain}`);
      
      if (!secondResponse.ok) {
        throw new Error(`Second API call failed with status: ${secondResponse.status}`);
      }
  
      // Parse second response and return
      const secondData = await secondResponse.json();
      return secondData;
  
    } catch (error) {
      console.log("Error in AI App data:", error);
      return null;
    }
  }
  
  
  /**
   * Firebase Cloud Function for account creation
   */
 app.post("/getSiteData", async (req, res) => {
    try {
      // Validate Authorization Header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized - Missing token" });
      }
  
      const idToken = authHeader.split(" ")[1];
      let decodedToken;
      try {
        decodedToken = await admin.auth().verifyIdToken(idToken);
      } catch (error) {
        console.error("Error verifying ID token:", error);
        return res.status(401).json({ error: "Unauthorized - Invalid token" });
      }
  
      const uid = decodedToken.uid;
      console.log("uid in getSiteData " + uid);
      const domain = req.body.domain; // Domain sent in request body
  
      if (!domain) {
        return res.status(400).json({ error: "Missing domain in request body" });
      }
  
      // Check if user exists in Firestore
      const db = admin.firestore();
      const usersDoc = db.collection("management").doc("users");
      const docSnapshot = await usersDoc.get();
      const usersData = docSnapshot.exists ? docSnapshot.data() : {};
  
      if (!usersData[uid]) {
        return res.status(404).json({ error: "User not found in Firestore" });
      }
      

      const logoFileName = `${Date.now()}`;
      // Fetch company logo
      const logoUrl = `https://logo.clearbit.com/${domain}`;
      const logoResponse = await fetch(logoUrl);
      let uploadedLogoUrl = null;
      if (logoResponse.ok) {
        const buffer = await logoResponse.arrayBuffer();
        const base64FileString = Buffer.from(buffer).toString("base64");
        uploadedLogoUrl = await uploadFile({
          base64FileString,
          filename: `logos/${logoFileName}.png`,
          contentType: "image/png",
        });
      }
  
      // Fetch about-us page content
     
  
      // Generate enriched data from ChatGPT
      const enrichedData = await generateCompanyData(domain,decodedToken.email);;
      enrichedData.logoUrl = `https://firebasestorage.googleapis.com/v0/b/socialmediabranding-31c73.firebasestorage.app/o/logos%2F${logoFileName}.png?alt=media`;
      // Update Firestore document
      const domainData = usersData[uid].domain || {};
      domainData[domain] =  enrichedData || {};
      usersData[uid].domain = domainData;
  
      await usersDoc.set(usersData);
      const dU = usersData[uid];
      console.log("inside not found domain " + JSON.stringify(dU));
      dU.domain = {
        [domain] : enrichedData
      }
      // Respond with updated user data
      res.status(200).json(dU);
    } catch (error) {
      console.error("Error in /createAccount:", error);
      res.status(500).json({ error: `Server error: ${error.message}` });
    }
  });
  app.get("/createAccount", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized - Missing token' });
      }
      const idToken = authHeader.split(" ")[1];
      let decodedToken;
      try {
        decodedToken = await admin.auth().verifyIdToken(idToken);
      } catch (error) {
        console.error('Error verifying ID token:', error);
        return res.status(401).json({ error: 'Unauthorized - Invalid token' });
      }
  
      // 3) Extract user info from decoded token
      //    This typically includes: uid, email, name (if set)
      const uid = decodedToken.uid;
      const email = decodedToken.email || null;
      const displayName = decodedToken.name || null;
  
      // 4) Store in Firestore
      const firestore = admin.firestore();
      const usersDoc = firestore.collection('management').doc('users');
      const docSnapshot = await usersDoc.get();
      const data = docSnapshot.exists ? docSnapshot.data() : {};
  
      // Merge or set the user's data
      data[uid] = {
        email,
        displayName,
        createdTime: `${Date.now()}`
      };
      await usersDoc.set(data);
      res.status(200).json(data);
    } catch (error) {
      console.error('Error in /createAccount:', error);
      res.status(500).json({ error: `Server error: ${error}` });
    }
  });
  app.get('/createAccountUsingGoogle', async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized - Missing token' });
      }
      const idToken = authHeader.split(' ')[1];
  
      let decodedToken;
      try {
        decodedToken = await admin.auth().verifyIdToken(idToken);
      } catch (error) {
        console.error('Error verifying ID token:', error);
        return res.status(401).json({ error: 'Unauthorized - Invalid token' });
      }
  
      const uid = decodedToken.uid;
      const email = decodedToken.email || null;
      const displayName = decodedToken.name || null;
  
      const firestore = admin.firestore();
      const usersDoc = firestore.collection('management').doc('users');
      const docSnapshot = await usersDoc.get();
      const data = docSnapshot.exists ? docSnapshot.data() : {};
  
      // Only create if user doesn't exist
      if (!data[uid]) {
        data[uid] = {
          email,
          displayName,
          createdTime: Date.now(),
        };
        await usersDoc.set(data);
        return res.status(200).json({ success: 'New account created for Google user.', data });
      } else {
        
            const d = data[uid];
            return res.status(200).send(`${d}`);
        
      }
    } catch (error) {
      console.error('Error in /createAccountUsingGoogle:', error);
      res.status(500).json({ error: `Server error: ${error}` });
    }
  });
  
app.post("/updateUserData", async (req, res) => {
    try {
        const {data} = req.body;
        if (!data) {
            return res.status(400).json({ error: "Invalid payload" });
        }
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ error: "Unauthorized - Missing token" });
        }
        const idToken = authHeader.split(" ")[1];
        let decodedToken;
        try {
            decodedToken = await admin.auth().verifyIdToken(idToken);
        } catch (error) {
            console.error("Error verifying ID token:", error);
            return res.status(401).json({ error: "Unauthorized - Invalid token" });
        }
        const firestore = admin.firestore();
        const users =  firestore.collection("management").doc("users");
        // Check if the requester is a superadmin
        const usersDoc = await users.get();
        if (!usersDoc.exists) {
            return res.status(401).json({ error: "Users doc does not exist" });
        }
        const usersData = usersDoc.data();
        if(!usersData[`${decodedToken.uid}`]) {
            return res.status(400).json({error: "No user exists by this Id"});
        }
        const specificUserData = usersData[`${decodedToken.uid}`];
        usersData[`${decodedToken.uid}`] = specificUserData;
        users.set(usersData);
        return res.status(200).status({success: "Data updated successfully"});
    } catch (error) {
        console.error("Error in /updateUserData:", error);
        res.status(500).json({ error: `Error ${error}` });
    }
});
app.post("/updatePostData", async (req, res) => {
  const {post} = req.body;

  const firestore = admin.firestore();
  const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ error: "Unauthorized - Missing token" });
        }
        const idToken = authHeader.split(" ")[1];
        let decodedToken;
        try {
            decodedToken = await admin.auth().verifyIdToken(idToken);
        } catch (error) {
            console.error("Error verifying ID token:", error);
            return res.status(401).json({ error: "Unauthorized - Invalid token" });
        }
  const doc = firestore.collection("management").doc("users");
  const docRef = await doc.get();
  const docData = docRef.data();
  const posts = docData[`${decodedToken.uid}`].posts;
  if(post.imageBase64 && post.imageBase64 != "") {
    const logoFileName = `${Date.now()}`;
   
    
      let uploadedLogoUrl = await uploadFile({
        base64FileString: post.imageBase64,
        filename: `${logoFileName}.png`,
        contentType: "image/png",
      });
    
    post.image = `https://firebasestorage.googleapis.com/v0/b/socialmediabranding-31c73.firebasestorage.app/o/${logoFileName}.png?alt=media`;
  }else {
    if(post.imageBase64) delete post.imageBase64;
  }
  const index = posts.findIndex((item) => item.post_id === post.post_id);

  // Replace the old post with the new data if found
  if (index !== -1) {
    posts[index] = post;
  }

  docData[`${decodedToken.uid}`].posts = posts;
  await doc.set(docData);
  res.status(200).json({success: "Post updated successfully"});
});
app.get("/getUserData", async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ error: "Unauthorized - Missing token" });
        }
        const idToken = authHeader.split(" ")[1];
        console.log(`Idtoken ${idToken}`);
        let decodedToken;
        try {
            decodedToken = await admin.auth().verifyIdToken(idToken);
            console.log("Found user");
        } catch (error) {
            console.error("Error verifying ID token:", error);
            return res.status(401).json({ error: "Unauthorized - Invalid token" });
        }
        const firestore = admin.firestore();
        const users =  firestore.collection("management").doc("users");
        // Check if the requester is a superadmin
        const usersDoc = await users.get();
        if (!usersDoc.exists) {
            return res.status(401).json({ error: "Users doc does not exist" });
        }
        
        const usersData = usersDoc.data();
        console.log(`Decoded token: ${JSON.stringify(decodedToken)}`);
        console.log(`user data ${JSON.stringify(usersData)}`);
        if(!usersData[`${decodedToken.uid}`]) {
            return res.status(400).json({error: "No user exists by this Id"});
        }
        const specificUserData = usersData[`${decodedToken.uid}`];
        
        return res.status(200).send(JSON.stringify(specificUserData));
    } catch (error) {
        console.error("Error in /getUserData:", error);
        res.status(500).json({ error: `Error ${error}` });
    }
});
app.get("/getPosts", async (req, res) => {
  try {
   
      const firestore = admin.firestore();
      const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ error: "Unauthorized - Missing token" });
        }
        const idToken = authHeader.split(" ")[1];
        let decodedToken;
        try {
            decodedToken = await admin.auth().verifyIdToken(idToken);
        } catch (error) {
            console.error("Error verifying ID token:", error);
            return res.status(401).json({ error: "Unauthorized - Invalid token" });
        }
      const users =  firestore.collection("management").doc("users");
      // Check if the requester is a superadmin
      const usersDoc = await users.get();
      if (!usersDoc.exists) {
          return res.status(401).json({ error: "Users doc does not exist" });
      }
      
      const usersData = usersDoc.data();
      
     
      const specificUserData = usersData[`${decodedToken.uid}`];
      
      return res.status(200).send(JSON.stringify(specificUserData));
  } catch (error) {
      console.error("Error in /getUserData:", error);
      res.status(500).json({ error: `Error ${error}` });
  }
});
exports.processPubSub = functions.https.onRequest(async (req, res) => {
  try {
    // Ensure that request body is parsed as JSON
    const jsonData = req.body;

    if (!jsonData || typeof jsonData !== 'object') {
      console.error("Invalid JSON payload:", jsonData);
      return res.status(400).send("Invalid JSON payload");
    }

    console.log("Pub sub called with data:", jsonData);

    const firestore = admin.firestore();
    const docRef = firestore.collection("management").doc("users");

    // Use Firestore transactions to ensure data consistency
    await firestore.runTransaction(async (transaction) => {
      const doc = await transaction.get(docRef);
      const docData = doc.data() || {};

      const userData = docData["gxittfw0Pwdk28o1cUF3CPnTgDB2"] || {};
      const siteData = userData.posts || [];

      siteData.push(jsonData);
      userData.posts = siteData;
      docData["gxittfw0Pwdk28o1cUF3CPnTgDB2"] = userData;

      transaction.set(docRef, docData);
    });

    console.log("Successfully updated Firestore.");
    return res.status(200).send("Data processed successfully");

  } catch (error) {
    console.error("Error processing message:", error);
    return res.status(500).send("Error processing message");
  }
});


exports.api = functions.https.onRequest(app);