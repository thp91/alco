/**
 * Génère l'entrée d'un compte du back-office pour la variable ADMIN_COMPTES.
 *   node scripts/creer-compte-admin.mjs
 * Le mot de passe est saisi sans écho et n'est jamais affiché ni enregistré :
 * seule son empreinte scrypt (avec un sel aléatoire) sort du script.
 */
import { randomBytes, scryptSync } from "node:crypto";
import { createInterface } from "node:readline";

function demander(question, masque = false) {
  return new Promise((resoudre) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    if (masque) {
      rl._writeToOutput = (texte) => {
        if (texte.startsWith(question)) rl.output.write(question);
      };
    }
    rl.question(question, (reponse) => {
      rl.close();
      if (masque) process.stdout.write("\n");
      resoudre(reponse);
    });
  });
}

const email = (await demander("E-mail : ")).trim().toLowerCase();
if (!/^[^\s@:,]+@[^\s@:,]+\.[^\s@:,]+$/.test(email)) {
  console.error("E-mail invalide.");
  process.exit(1);
}

const motDePasse = await demander("Mot de passe (8 caractères min.) : ", true);
if (motDePasse.length < 8) {
  console.error("Mot de passe trop court.");
  process.exit(1);
}
if ((await demander("Confirmation : ", true)) !== motDePasse) {
  console.error("Les deux saisies diffèrent.");
  process.exit(1);
}

const sel = randomBytes(16);
const empreinte = scryptSync(motDePasse, sel, 64);

console.log("\nEntrée à ajouter à ADMIN_COMPTES (séparer plusieurs comptes par des virgules) :\n");
console.log(`${email}:scrypt:${sel.toString("base64url")}:${empreinte.toString("base64url")}`);
