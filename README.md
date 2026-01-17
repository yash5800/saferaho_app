 

# Day 3 (client + backend)
- Designed Signup page in client to register user and validate each input before sending to server 
  generating masterKey by user password
  generating authHash with user password
  encrypting masterKey with user password(password Key with pbkdf2)
  encrypting masterKey with recoveryKey(24 recovery words with bip39)
- Implemented Sign up on backend endpoints (check,register)
  check ~ user email or username exists or not
  register ~ storing all encrypted data of new user

# Day 4 (client + backend)
- Designed Signin page and client side validations before sending to server
- Implemeted Sign In on backend endpoints (check1,check2)
  check1 ~ userExists or not before next phase and send Authsalt
  check2 ~ validate client AuthHash and server AuthHash of user later sending session Tokens

# Day 5 (client + backend)
- added Session validation Layer for auto login with SessionService Class
- implemeted Session Validation in backend API endpoints (signin / signup) generating accesToken for 15mins and refreshToken 7days

# Day 6 (client)
- added biomatic / password lock in UserData Layer, when app is closed / background (major)
- adjusted session / JWT validation Class to refreshToken working
- implemented basic storing settings of user in mmkv with StorageSerives class 


expo-router generate