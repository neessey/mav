# MARASSEURAVIE — notifications push réelles

Le système de notifications a été relié de bout en bout :

1. L’admin installe/ouvre la PWA et clique sur **Activer les notifications push**.
2. Le navigateur demande la permission.
3. La PWA enregistre `public/sw.js` et crée une vraie souscription Web Push avec la clé VAPID du serveur.
4. La souscription est enregistrée côté serveur (Firestore `pushSubscriptions` si Firebase Admin est configuré, sinon fichier local).
5. Quand une commande est créée dans Firestore, le frontend appelle `/api/notifications/order`.
6. Le serveur envoie une vraie notification Web Push à tous les appareils admin abonnés, même si la PWA est en arrière-plan ou fermée.

## Déploiement

**Important : cette application doit être déployée avec `server.ts` actif.**
Un hébergement statique qui sert uniquement `dist/` ne peut pas exécuter les routes `/api/notifications/*`.

### Variables serveur

Générer une paire VAPID une seule fois :

```bash
npm run generate-vapid
```

Puis mettre les deux valeurs dans l’environnement de production :

- `VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`
- `VAPID_SUBJECT=mailto:contact@marasseuravie.com`

Et configurer Firebase Admin :

- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`

Les `VITE_FIREBASE_*` restent côté client comme avant.

### Après déploiement

1. Ouvrir la PWA avec HTTPS.
2. Aller dans **Admin → Notifications**.
3. Cliquer **Activer les notifications push**.
4. Autoriser les notifications dans le navigateur / les réglages du téléphone.
5. Le test réel est envoyé automatiquement.
6. Passer ensuite une commande depuis le site client : l’appareil admin doit recevoir la notification.

### Important sécurité

Le fichier `.env` contenant une clé privée Firebase n’est volontairement pas inclus dans cette archive. Si cette clé a déjà été publiée, partagée ou commitée, il faut la révoquer/régénérer dans Firebase/Google Cloud et remplacer la variable `FIREBASE_PRIVATE_KEY` en production.
