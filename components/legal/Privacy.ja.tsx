import { LEGAL_INFO } from "@/config/legal";
import { H1, H2, H3, P, UL, HR, Meta, Strong } from "@/components/legal/prose";

// NOTE on JSX text whitespace: Japanese has no inter-word spaces, so
// any source-level newline inside a text node renders as a visible
// half-width space between native characters. Each <P> / <li> body
// is therefore kept on a single source line. Do not "reflow" the
// content in your editor — the long lines are intentional.

export default function PrivacyJa() {
  const L = LEGAL_INFO;
  return (
    <article>
      <H1>プライバシーポリシー</H1>
      <Meta>
        <Strong>施行日:</Strong> {L.effectiveDate}
        <br />
        <Strong>最終更新日:</Strong> {L.lastUpdated}
      </Meta>

      <P>
        Lost &amp; Found Korea(以下「LFK」「当社」「私たち」といいます)は、お客様のプライバシーを尊重します。本プライバシーポリシー(以下「本ポリシー」といいます)は、お客様が当社のウェブサイトおよびサービスをご利用される際に、当社がお客様の個人情報をどのように収集・利用・共有・保護するかについて説明するものです。
      </P>
      <P>
        当社のサービスをご利用いただくことで、お客様は本ポリシーに記載された取り扱いに同意されたものとみなされます。
      </P>

      <HR />

      <H2>1. 当社が収集する情報</H2>

      <H3>1.1 お客様からご提供いただく情報</H3>
      <P>
        忘れ物のご依頼や当社へのお問い合わせをいただく際、お客様より以下の情報をご提供いただく場合があります:
      </P>
      <UL>
        <li>識別情報:お名前、メールアドレス、電話番号</li>
        <li>紛失されたお品物に関する情報:特徴、紛失したおおよその場所と時刻、写真</li>
        <li>配送に関する情報:配送先住所、国、お受け取り人のお名前とご連絡先</li>
        <li>お支払い情報:PayPalまたはその他の第三者決済事業者を通じて処理されます(当社ではクレジットカードの完全な情報を保存しておりません)</li>
        <li>やり取りの内容:お客様から当社にお送りいただくメッセージ</li>
      </UL>

      <H3>1.2 自動的に収集される情報</H3>
      <UL>
        <li>IPアドレスとおおよその位置情報</li>
        <li>ブラウザの種類、オペレーティングシステム、デバイス情報</li>
        <li>閲覧ページ、滞在時間、参照元URL</li>
        <li>Cookieおよび同様のトラッキング技術</li>
      </UL>

      <H3>1.3 第三者から取得する情報</H3>
      <UL>
        <li>決済事業者(取引の確認)</li>
        <li>配送業者(追跡情報および配送状況)</li>
        <li>施設の運営者(お品物の詳細、受け取り確認)</li>
      </UL>

      <HR />

      <H2>2. 情報の利用方法</H2>
      <P>当社はお客様の情報を以下の目的で利用いたします:</P>
      <UL>
        <li>忘れ物の回収および配送に関するご依頼を処理するため</li>
        <li>お客様に代わって施設、配送業者、関係機関と連絡を取るため</li>
        <li>ご依頼の進捗状況をお知らせするため</li>
        <li>お支払いを処理し、領収書を発行するため</li>
        <li>お問い合わせへの対応およびカスタマーサポートをご提供するため</li>
        <li>当社のサービスおよびウェブサイトを改善するため</li>
        <li>法令上の義務を遵守するため</li>
        <li>不正行為または濫用を検知・防止するため</li>
      </UL>
      <P>
        当社は、お客様の個人情報を第三者に販売することはございません。
      </P>

      <HR />

      <H2>3. お品物の中身の確認</H2>
      <P>
        回収および梱包の過程で、当社は身の回り品を含むお品物を取り扱う場合があります。当社の方針は以下のとおりです:
      </P>
      <UL>
        <li>安全な梱包に必要な範囲を超えて、お品物の中身を日常的に確認することはいたしません。</li>
        <li>お客様から「中身を確認しないでほしい」とのご要望があった場合、当社はそのご要望をお守りいたします。</li>
        <li>取り扱いの過程で偶然中身を目にすることがあった場合も、それを機密情報として取り扱い、記録、撮影、または共有することはいたしません。</li>
      </UL>

      <HR />

      <H2>4. 情報の共有</H2>
      <P>
        当社は、サービスの提供に必要な範囲でのみお客様の情報を共有いたします:
      </P>

      <H3>4.1 業務委託先</H3>
      <UL>
        <li>配送業者(EMS、DHL、FedEx、UPSなど)</li>
        <li>施設の運営者(ロッカー、空港、ホテル)</li>
        <li>決済事業者(PayPalなど)</li>
        <li>ホスティングおよびインフラ提供事業者</li>
      </UL>

      <H3>4.2 法令上の要請</H3>
      <P>
        法令、裁判所の命令、または政府機関からの要請に基づき必要な場合、または当社の法的権利の保護、不正行為の防止、もしくは他者の安全の保護のために、当社はお客様の情報を開示する場合があります。
      </P>

      <H3>4.3 事業承継</H3>
      <P>
        LFKが合併、買収、または事業譲渡の対象となる場合、お客様の情報が承継される可能性があります。その際、変更内容について事前にご通知いたします。
      </P>

      <HR />

      <H2>5. 国際的なデータ移転</H2>
      <P>
        LFKは大韓民国に拠点を置いております。お客様が韓国外から当社のサービスをご利用の場合、お客様の情報は韓国に移転、保存、および処理されます。
      </P>
      {/* TRANSLATION REVIEW: GDPR-flavored legal-basis wording (consent + necessity-of-performance under Art. 6(1)(a)/(b)). Verify whether Japanese-facing readers under APPI/PIPA framing need additional clarification on the lawful-basis concept. */}
      <P>
        欧州経済領域(EEA)、英国、またはその他のデータ保護規制が適用される地域にお住まいのお客様について、当社は本データ移転の法的根拠として、お客様の同意およびお客様がご依頼されたサービスを提供するために必要な移転であることに依拠しております。
      </P>

      <HR />

      <H2>6. Cookieおよびトラッキング</H2>
      <P>
        当社のウェブサイトでは、お客様の設定の記憶、ウェブサイトのトラフィック分析、およびユーザー体験の改善のため、Cookieおよび同様の技術を使用しております。Cookieはブラウザの設定により制御していただけます。
      </P>

      <HR />

      <H2>7. データの保有期間</H2>
      <P>当社は、お客様の個人情報を必要な期間に限り保有いたします:</P>
      <UL>
        <li>進行中のご依頼に関するデータ:サービス提供期間およびその後の合理的なフォローアップ期間</li>
        <li>取引記録:韓国の税法および商法上必要な期間(通常5年間)</li>
        <li>やり取りの履歴:最大3年間</li>
        <li>アカウント・連絡先情報:お客様より削除をご依頼いただくまで、または不要となるまで</li>
      </UL>
      <P>
        保有期間経過後、お客様の情報は安全に削除または匿名化されます。
      </P>

      <HR />

      <H2>8. お客様の権利</H2>
      <P>
        お客様の居住される法域によっては、以下の権利が認められる場合があります:
      </P>
      <UL>
        <li>当社が保有するお客様の個人情報へのアクセス(開示請求)</li>
        <li>不正確または不完全な情報の訂正</li>
        <li>お客様の情報の削除(法令上の保有義務に従います)</li>
        <li>特定の利用への異議申し立てまたは利用制限の請求</li>
        <li>同意に基づく処理に対する同意の撤回</li>
        <li>データポータビリティ</li>
        <li>データ保護機関への苦情の申し立て</li>
      </UL>
      <P>
        これらの権利を行使される場合は、
        <a
          href={`mailto:${L.supportEmail}`}
          className="text-accent hover:underline"
        >
          {L.supportEmail}
        </a>
        までご連絡ください。
      </P>

      <HR />

      <H2>9. セキュリティ</H2>
      <P>
        当社は、お客様の情報を保護するため、HTTPS暗号化、個人データへのアクセス制限、および決済処理における安全な第三者サービスの利用を含む、合理的な技術的および組織的措置を講じております。
      </P>
      <P>
        ただし、いかなるシステムも完全に安全であるとは限りません。インターネット上で送信される情報の絶対的な安全性を保証することはできません。
      </P>

      <HR />

      <H2>10. 子どものプライバシー</H2>
      {/* TRANSLATION REVIEW: "individuals under 14 years of age" — the 14-year threshold is calibrated to Korean PIPA Art. 22-2 (children under 14 require legal guardian consent), not Japanese APPI. Translating verbatim preserves legal accuracy of the source, but Japanese readers familiar with APPI may find the age unusual. Confirm with Japanese privacy counsel whether to keep 14歳 or to add a contextual note. */}
      <P>
        当社のサービスは、14歳未満の方を対象としておりません。当社は、子どもから個人情報を意図的に収集することはございません。万が一、子どもから情報を収集していたことが判明した場合は、速やかに削除いたします。
      </P>

      <HR />

      <H2>11. 第三者サイトへのリンク</H2>
      <P>
        当社のウェブサイトには、第三者のウェブサイトへのリンクが含まれている場合があります。当該サイトのプライバシーに関する取り扱いについて、当社は責任を負いません。
      </P>

      <HR />

      <H2>12. 本ポリシーの変更</H2>
      <P>
        当社は、本プライバシーポリシーを随時更新する場合があります。重要な変更については、メールまたはウェブサイト上の通知を通じてお知らせいたします。
      </P>

      <HR />

      <H2>13. 個人情報保護責任者</H2>
      <P>
        <Strong>個人情報保護に関するお問い合わせ窓口</Strong>
      </P>
      <UL>
        <li>氏名:{L.privacyContactName}</li>
        <li>役職:{L.privacyContactTitle}</li>
        <li>
          メールアドレス:{" "}
          <a
            href={`mailto:${L.privacyContactEmail}`}
            className="text-accent hover:underline"
          >
            {L.privacyContactEmail}
          </a>
        </li>
        <li>郵送先住所:{L.address}</li>
      </UL>
      <P>
        <Strong>{L.businessName}</Strong>(以下「LFK」)は、{L.operatingCompany}が運営するサービスです。
      </P>
      <UL>
        <li>サービス名:{L.businessName}</li>
        <li>運営会社:{L.operatingCompany}</li>
        <li>代表者:{L.ceo}</li>
        <li>事業者登録番号:{L.businessRegistrationNumber}</li>
        <li>通信販売業申告:{L.ecommerceRegistration}</li>
        <li>所在地:{L.address}</li>
      </UL>

      <HR />

      <H2>14. 言語について</H2>
      <P>
        本ポリシーは、お客様の便宜のために日本語に翻訳されています。本ポリシーの英語版と日本語版の間に解釈上の相違がある場合は、英語版が優先されます。
      </P>

      <HR />

      <P>
        LFKのサービスをご利用いただくことで、お客様は本プライバシーポリシーをお読みになり、内容をご理解いただいたものとみなされます。
      </P>
    </article>
  );
}
