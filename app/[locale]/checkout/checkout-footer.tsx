import Link from "next/link";
import React from "react";

export default function CheckoutFooter() {
  return (
    <div className="border-t-2 space-y-2 my-4 py-4">
      <p>
        Besoin d&apos;aide ? Consultez notre{" "}
        <Link href="/page/help">centre d&apos;aide</Link> ou{" "}
        <Link href="/page/contact-us">Contacter nous</Link>{" "}
      </p>
      <p>
        Pour un article commandé chez PYASTI : Lorsque vous cliquez sur le
        bouton « Passer commande », nous vous enverrons un e-mail accusant
        réception de votre commande. Votre contrat d&apos;achat ne sera conclu
        qu&apos;à compter de la réception de l&apos;e-mail vous informant de son
        expédition. En passant commande, vous acceptez{" "}
        <Link href="/page/privacy-policy">la politique de confidentialité</Link>{" "}
        et{" "}
        <Link href="/page/conditions-of-use">
          {" "}
          les conditions d&apos;utilisation
        </Link>{" "}
        de PYASTI.
      </p>
    </div>
  );
}
