# Thamheed Academy — സജ്ജീകരണ ഗൈഡ (ഫോണിൽ ചെയ്യാവുന്നത്)

ഈ ഫോൾഡറിലെ എല്ലാ ഫയലുകളും ഒരേ നിരയിലാണ് (ഉപ-ഫോൾഡർ ഇല്ല), അതിനാൽ GitHub-ൽ ഫോണിൽ നിന്ന് അപ്‌ലോഡ് ചെയ്യാം.

## 1. Firebase ഒരുക്കുക (console.firebase.google.com)
1. **Add project** → പേര് `thamheed-academy` → Google Analytics ഓഫ് ആക്കാം.
2. **Build → Authentication → Get started → Sign-in method**: **Email/Password**, **Anonymous** എന്നിവ Enable ചെയ്യുക.
3. **Authentication → Users → Add user**: നിങ്ങളുടെ Admin Email, Password നൽകുക.
4. **Build → Firestore Database → Create database** → *Production mode* → സ്ഥലം `asia-south1 (Mumbai)`.
5. Firestore → **Rules** ടാബ്: `firestore.rules` ഫയലിലെ മുഴുവൻ എഴുത്തും പകർത്തി ഒട്ടിക്കുക. `PASTE_ADMIN_EMAIL` മാറ്റി നിങ്ങളുടെ Admin Email (ചെറിയ അക്ഷരത്തിൽ) നൽകുക → **Publish**.
6. **Project settings (ഗിയർ) → Your apps → Web (`</>`)** → ആപ്പ് രജിസ്റ്റർ ചെയ്യുക → കാണുന്ന `firebaseConfig` മൂല്യങ്ങൾ `firebase-config.js` ൽ ഒട്ടിക്കുക. അതിലെ `ADMIN_EMAILS` ലും Admin Email നൽകുക.

## 2. GitHub-ൽ ഇടുക
1. github.com → **New repository** → പേര് `thamheed-academy` → **Public** → Create.
2. **Add file → Upload files** → ഈ ഫോൾഡറിലെ എല്ലാ ഫയലുകളും (ഐക്കണുകൾ ഉൾപ്പെടെ) തിരഞ്ഞെടുത്ത് → **Commit changes**.
3. **Settings → Pages → Source: Deploy from a branch → `main` / `(root)` → Save.**
4. ഒരു മിനിറ്റിനുള്ളിൽ ലിങ്ക് കിട്ടും: `https://നിങ്ങളുടെ-GitHub-പേര്.github.io/thamheed-academy/`

## 3. Firebase-ൽ ലിങ്ക് അനുവദിക്കുക
Authentication → **Settings → Authorized domains → Add domain** → `നിങ്ങളുടെ-GitHub-പേര്.github.io`

## 4. ഉപയോഗം
- **Admin:** ലിങ്കിന്റെ അവസാനം `#admin` ചേർത്ത് തുറക്കുക (അല്ലെങ്കിൽ ലോഗിൻ സ്ക്രീനിലെ ലോഗോയിൽ 5 തവണ ടാപ്പ്). Email/Password നൽകി പ്രവേശിക്കാം. മാറ്റങ്ങൾ ഉടൻ തന്നെ ബാധകമാകും, "പ്രസിദ്ധീകരിക്കുക" ബട്ടൺ വേണ്ട.
- **വിദ്യാർത്ഥികൾ:** Admin → വിദ്യാർത്ഥികൾ → ചേർക്കുക (🔑 ബട്ടൺ ഊഹിക്കാൻ പറ്റാത്ത ID ഉണ്ടാക്കും) → ID കുട്ടിക്ക് നൽകുക.
- **ഇൻസ്റ്റാൾ:** Chrome മെനു → *Install app* / *Add to Home screen*.

## 5. അപ്ഡേറ്റ് ചെയ്യാൻ
മാറിയ ഫയൽ GitHub-ൽ തുറന്ന് ✏️ (Edit) → പുതിയ എഴുത്ത് ഒട്ടിക്കുക → **Commit**. (അല്ലെങ്കിൽ Add file → Upload files വഴി അതേ പേരിൽ ഫയൽ വീണ്ടും ഇടുക.) ഏകദേശം ഒരു മിനിറ്റിൽ ആപ്പിൽ കാണും.

## ശ്രദ്ധിക്കുക
- ഈ കോഡ് Firebase-മായി ബന്ധിപ്പിച്ച് പരീക്ഷിച്ചിട്ടില്ല. ആദ്യം ഒരു ടെസ്റ്റ് വിദ്യാർത്ഥിയെ ചേർത്ത് ലോഗിൻ, ക്ലാസ് അനുസരിച്ചുള്ള ഉള്ളടക്കം, WhatsApp എന്നിവ പരിശോധിക്കുക.
- Student ID ആണ് വിദ്യാർത്ഥിയുടെ "പാസ്‌വേഡ്". അതുകൊണ്ട് 🔑 ഉപയോഗിച്ച് ഉണ്ടാക്കിയ ദൈർഘ്യമുള്ള ID തന്നെ ഉപയോഗിക്കുക.
- Firebase-ന്റെ സൗജന്യ പ്ലാനിന് പരിധികളുണ്ട്. കുട്ടികളുടെ എണ്ണം കൂടുമ്പോൾ Firebase-ലെ Usage പേജ് നോക്കുക.
