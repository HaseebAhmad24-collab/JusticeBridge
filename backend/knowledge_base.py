from typing import Dict, List
from rag_system import rag_engine

LEGAL_KNOWLEDGE = {
    "ppc": {
        "title": "Pakistan Penal Code (PPC) 1860",
        "description": "The fundamental criminal code governing offenses within Pakistan.",
        "full_document_en": """
# Pakistan Penal Code (PPC) 1860 - Overview

The Pakistan Penal Code (PPC) of 1860 is the primary criminal law statute in Pakistan. It outlines the various offenses that can be committed and prescribes the punishments for each. 

## Key Chapters and Sections

### 1. General Provisions (Chapters I - IV)
*   **Sections 1-5:** Outline the title and extent of the code, applicable throughout Pakistan.
*   **Chapter II (General Explanations):** Definitions of legal terms like 'Offence', 'Public Servant', and 'Dishonestly'.
*   **Chapter IV (General Exceptions):** Defines circumstances where an act is NOT an offense, such as:
    *   **Private Defense (Sec 96-106):** The right to defend one's body and property.
    *   **Unsound Mind (Sec 84):** Acts committed by individuals incapable of understanding their actions.

### 2. Offenses Affecting the Human Body (Chapter XVI)
This is the most critical chapter for crimes against individuals.
*   **Qatl-e-Amd (Murder - Sec 302):** Punishment for intentional murder.
*   **Hurt (Sec 332-337):** Defines various levels of physical injury.
*   **Kidnapping and Abduction (Sec 359-368).**
*   **Rape (Sec 375-376):** Definition and severe punishments for sexual assault.

### 3. Offenses Against Property (Chapter XVII)
*   **Theft (Sec 378-382):** Dishonest removal of movable property.
*   **Robbery & Dacoity (Sec 390-402):** Violent forms of theft involving groups.
*   **Cheating (Sec 415-420):** Fraudulent inducement and property delivery.
*   **Criminal Trespass (Sec 441).**

### 4. Economic Offenses
*   **Dishonest Issuance of Cheque (Sec 489-F):** Criminalizes checking accounts with insufficient funds.

---
*Disclaimer: This is a professional summary for educational purposes. Consult a licensed legal practitioner for specific case proceedings.*
"""
    },
    "constitution": {
        "title": "Constitution of Pakistan 1973",
        "description": "The supreme law of Pakistan establishing the state structure and rights.",
        "full_document_en": """
# Constitution of Pakistan 1973

The 1973 Constitution is the supreme law of Pakistan, establishing the framework for the government and the fundamental rights of its citizens.

## Fundamental Rights (Part II)
The Constitution guarantees basic freedoms that cannot be taken away by any law.
*   **Article 9 (Security of Person):** No person shall be deprived of life or liberty except in accordance with the law.
*   **Article 10 (Safeguards as to Arrest):** Right to be informed of grounds for arrest and right to legal counsel.
*   **Article 10A (Fair Trial):** Every person is entitled to a fair trial and due process.
*   **Article 14 (Privacy & Dignity):** Professional protection of human dignity and privacy of home.
*   **Article 19 (Freedom of Speech):** Right to speech and freedom of the press.
*   **Article 25 (Equality):** All citizens are equal before the law; no discrimination based on gender.
*   **Article 25A (Education):** Right to free and compulsory education for children.

## Structure of Government
*   **Parliament (Majlis-e-Shoora):** Consists of the National Assembly and the Senate.
*   **Judiciary:** Features an independent Supreme Court, High Courts, and Federal Shariat Court.
*   **State Religion:** Article 2 declares Islam as the state religion.

---
*Disclaimer: This summary reflects the current constitutional framework as of its latest amendment.*
"""
    },
    "crpc": {
        "title": "Code of Criminal Procedure (CrPC) 1898",
        "description": "The procedural framework for criminal investigations and trials.",
        "full_document_en": """
# Code of Criminal Procedure (CrPC) 1898

The CrPC provides the step-by-step procedure for the enforcement of criminal law in Pakistan.

## Key Procedural Stages

### 1. Investigation & FIR (Sec 154-176)
*   **First Information Report (FIR):** Written record prepared by the police when they receive information about a cognizable offense.
*   **Police Powers:** Rules governing search, seizure, and the collection of evidence.

### 2. Arrest and Bail (Sec 46-67, 496-498)
*   **Sec 54:** Circumstances under which the police can arrest without a warrant.
*   **Post-Arrest Bail (Sec 497):** Judicial release after arrest while the trial is pending.
*   **Pre-Arrest Bail (Sec 498):** Protective bail granted to prevent humiliation or malicious arrest.

### 3. Trial Process
*   Defines the powers of Magistrates and Sessions Courts.
*   Outlines how charges are framed and how evidence is recorded.

---
*Disclaimer: Procedural laws are subject to local amendments and judicial interpretations.*
"""
    },
    "cpc": {
        "title": "Code of Civil Procedure (CPC) 1908",
        "description": "Rules for civil court proceedings and lawsuit management.",
        "full_document_en": """
# Code of Civil Procedure (CPC) 1908

The CPC governs the process through which civil disputes (property, contracts, family heritage) are resolved in court.

## Core Concepts
*   **Plaint (Order 7):** The starting document where the plaintiff states their case.
*   **Written Statement (Order 8):** The defendant's formal reply to the plaint.
*   **Issues (Order 14):** The specific points of fact or law that the court must decide.

## Key Sections
*   **Section 11 (Res Judicata):** A final decision by a court on a matter prevents the parties from litigating it again.
*   **Section 96 (Appeals):** The right of a party to challenge a decree in an appellate court.

---
*Disclaimer: Civil litigation often involves complex local rules; professional advice is recommended.*
"""
    },
    "inheritance": {
        "title": "Islamic Law of Inheritance",
        "description": "Rules for distributing the estate of a deceased person.",
        "full_document_en": """
# Islamic Law of Inheritance (Sharia/Pakistan)

In Pakistan, the inheritance of Muslim citizens is governed by Sharia principles and the Muslim Family Laws Ordinance.

## General Principles
*   **Compulsory Shares:** Heirs are entitled to fixed shares that cannot be changed by a will (Wasiyat) for more than 1/3 of the total estate.
*   **Gender-Based Distribution:** Generally, a male heir (son) receives a share equal to that of two females (daughters) in similar kinship.

## Fixed Shares (Al-Faraid)
*   **Widow:** Gets 1/8 if children exist, 1/4 if no children.
*   **Husband:** Gets 1/4 if children exist, 1/2 if no children.
*   **Daughter:** Gets 1/2 if she is the only child. If two or more, they share 2/3.
*   **Son:** Acts as a 'Residuary' heir after other fixed shares are given.

### Women's Rights in Pakistan
The Pakistani judiciary strictly protects the inheritance rights of women. Depriving a woman of her legal inheritance is a criminal offense under the PPC.

---
*Disclaimer: Inheritance calculation depends on the specific number and types of surviving relatives.*
"""
    },
    "nikah-talaq": {
        "title": "Marriage, Divorce, and Family Law",
        "description": "Legal procedures for Nikah, Talaq, and Khula in Pakistan.",
        "full_document_en": """
# Marriage and Divorce Laws (MFLO 1961)

Family law in Pakistan is governed by the Muslim Family Laws Ordinance 1961 and the Family Courts Act 1964.

## 1. Nikah (Marriage)
*   **Contract:** Nikah is a civil contract (Nikah Nama).
*   **Requirements:** Free consent of bride and groom, 2 witnesses, and Haq Mehr (Dower).
*   **Registration:** Mandatory registration with the Union Council is required for legal recognition.

## 2. Talaq (Divorce by Husband)
*   **Notice:** The husband must send a written notice to the Union Council Chairman and a copy to the wife.
*   **Waiting Period (Iddat):** The divorce becomes effective after 90 days from the date of notice.
*   **Arbitration:** The Union Council attempts reconciliation during the 90-day period.

## 3. Khula (Divorce by Wife)
*   **Court Decree:** A wife can seek dissolution of marriage through a Family Court.
*   **Compensation:** The wife may be required to return her dower (Haq Mehr) as compensation to the husband.

---
*Disclaimer: Family matters are sensitive; consult the Family Courts for official proceedings.*
"""
    },
    "custody": {
        "title": "Child Custody and Guardianship",
        "description": "Rules governing 'Hazanat' and the welfare of children.",
        "full_document_en": """
# Child Custody Laws (Hizanat)

Custody in Pakistan is decided based on the Guardians and Wards Act 1890 and Personal Laws.

## Paramount Principle
The **Welfare of the Minor** is the single most important factor. Courts act as 'Loco Parentis' to protect the child's best interests.

## Rights of Parents
*   **Mother's Right (Hizanat):** Generally has primary custody of:
    *   Sons until the age of 7.
    *   Daughters until they reach puberty.
*   **Father's Right (Willayat):** Remains the legal guardian (financial and major decisions) even if physical custody is with the mother.

## Loss of Custody
A mother may lose her right to Hizanat if:
*   She remarries a 'stranger' (someone outside prohibited degrees of the child).
*   Her conduct is found to be harmful to the child's moral or physical wellbeing.

---
*Disclaimer: Every custody case is decided on its unique merits in a Guardian Court.*
"""
    },
    "evidence": {
        "title": "Qanoon-e-Shahadat Order 1984",
        "description": "The evidentiary law governing how facts are proved in court.",
        "full_document_en": """
# Qanoon-e-Shahadat Order 1984 (Evidence Act)

The QSO replaced the colonial Evidence Act of 1872 to align specific rules of proof with Islamic injunctions.

## Key Articles
*   **Article 3 (Competency):** Every person is a competent witness unless the court finds they cannot understand questions.
*   **Article 17 (Number of Witnesses):** 
    *   Financial matters: Typically requires 2 men or 1 man & 2 women.
    *   Criminal matters (Hadd): Requires higher standards.
*   **Article 164 (Modern Evidence):** Explicitly permits the court to consider evidence generated through modern devices (Audio, Video, CCTV, Forensic data).

## Burden of Proof
In criminal cases, the burden of proving the guilt of the accused "beyond a reasonable doubt" lies strictly on the prosecution.

---
*Disclaimer: Technical rules of evidence are critical for trial outcomes; professional legal assistance is vital.*
"""
    },
    "zakat": {
        "title": "Zakat and Charity Laws (Islamic Jurisprudence)",
        "description": "Rules for calculating and distributing Zakat in accordance with Sharia.",
        "full_document_en": """
# Zakat and Charity in Islam

Zakat is one of the five pillars of Islam and is a mandatory charitable contribution for every adult Muslim who meets the wealth threshold (Nisab).

## 1. The Concept of Zakat
*   **Purpose:** To purify wealth and provide social security for the poor and needy.
*   **Rate:** Typically 2.5% of the total savings and wealth that has been in one's possession for a full lunar year.

## 2. Nisab (The Threshold)
Zakat is only mandatory if one's wealth exceeds the Nisab. 
*   **Gold Nisab:** 87.48 grams (7.5 Tolas).
*   **Silver Nisab:** 612.36 grams (52.5 Tolas).
*   **Cash/Assets:** If the value of cash, jewelry, or trade goods exceeds the value of the Silver Nisab, Zakat becomes obligatory.

## 3. Eligible Recipients (Asnaf)
The Quran specifies eight categories of people eligible to receive Zakat:
1.  The Poor (Al-Fuqara).
2.  The Needy (Al-Masakin).
3.  Zakat Administrators.
4.  Those whose hearts are to be reconciled.
5.  To free captives/slaves.
6.  Those in debt.
7.  In the cause of Allah.
8.  The Wayfarer (travelers).

## 4. Zakat in Pakistan
In Pakistan, the **Zakat and Ushr Ordinance 1980** governs the deduction of Zakat from bank accounts on the 1st of Ramadan. Citizens can file 'Form CZ-50' (Exemption Form) if they wish to distribute Zakat personally according to their school of thought.

---
*Disclaimer: Zakat calculations can vary based on personal circumstances and religious schools of thought.*
"""
    },
    "family-courts": {
        "title": "Family Courts Act 1964",
        "description": "The procedural law for family disputes in Pakistan.",
        "full_document_en": """
# Family Courts Act 1964 - Overview

The Family Courts Act of 1964 establishes specialized courts in Pakistan to provide expeditious settlement of disputes relating to marriage and family affairs.

## 1. Exclusive Jurisdiction
Family Courts have exclusive jurisdiction over matters listed in the Schedule:
*   Dissolution of marriage (including Khula).
*   Restitution of conjugal rights.
*   Dower (Haq Mehr).
*   Maintenance.
*   Guardianship and custody of children.
*   Jactitation of marriage.
*   Personal property and belongings of a wife.

## 2. Key Features
*   **Expeditious Trial:** The Act aims to resolve family disputes much faster than regular civil suits.
*   **Reconciliation:** The Court is legally mandated to attempt reconciliation between the parties at two stages:
    1.  **Pre-Trial:** Before recording evidence.
    2.  **Post-Trial:** After recording evidence but before the final judgment.
*   **Summary Procedure:** Trials are conducted in a simplified manner to avoid technical delays.

## 3. Appeals
Decisions of a Family Court can be appealed in the District Court, except for certain cases like a decree for dissolution of marriage (unless it involves specific grounds or dower).

---
*Disclaimer: This summary is for informational purposes. Family legal matters require professional guidance.*
"""
    },
    "land-transfer": {
        "title": "Land Transfer & Property Registration",
        "description": "A comprehensive guide to the registration process in Pakistan.",
        "full_document_en": """
# Land Transfer and Property Registration in Pakistan

Transferring property in Pakistan involves a specific legal process governed by the Registration Act 1908 and the Transfer of Property Act 1882.

## 1. Required Documentation
*   **Sale Deed (Bayana):** The contract between buyer and seller.
*   **CNIC:** Valid identity cards of both parties and two witnesses.
*   **Fard-e-Malkiat:** A document from the Patwari or Land Record Authority (PLRA) confirming ownership.
*   **No Objection Certificate (NOC):** Required from various authorities (LDA, CDA, Society Office) if applicable.

## 2. The Step-by-Step Process
1.  **Verification:** Verify the title of the property and ensure no encumbrances exist.
2.  **Stamp Duty:** Purchase stamp paper of appropriate value based on the property price.
3.  **Execution:** Sign the sale deed in the presence of witnesses.
4.  **Registration:** Submit the deed to the Sub-Registrar's office for official recording.
5.  **Mutation (Intiqal):** The final step where the land record is updated in the name of the new owner.

## 3. Digital Records
Modern systems like the Punjab Land Records Authority (PLRA) have digitized records, making 'Fard' issuance and mutation much more transparent.

---
*Disclaimer: Property laws can vary by province and local development authorities.*
"""
    },
    "legal-ai": {
        "title": "The Future of AI in Legal Consulting",
        "description": "How automation and AI are transforming the legal landscape.",
        "full_document_en": """
# The Future of AI in Legal Consulting

Artificial Intelligence is revolutionizing how legal services are delivered, focusing on efficiency, research, and predictive analytics.

## 1. Automated Legal Research
Tools like JusticeBridge can scan thousands of law sections in seconds, providing lawyers with instant references that previously took hours of manual searching.

## 2. Predictive Analytics
AI models can analyze historical judgments to predict potential case outcomes based on judge behavior, similar precedents, and legal technicalities.

## 3. Document Automation
Drafting standard contracts, notices, and pleadings can now be automated through AI, allowing junior lawyers to focus on more complex litigation strategy.

## 4. Accessibility for Citizens
The primary impact of Legal AI is the democratization of knowledge. Citizens can now understand their basic rights and procedural requirements without expensive initial consultations.

---
*Disclaimer: AI is a tool to assist, not a replacement for the human judgment and ethical oversight of a licensed lawyer.*
"""
    },
    "police": {
        "title": "Police Point Checking & Rights",
        "description": "Rules for police check-posts (Nakas) and citizen rights in Pakistan.",
        "full_document_en": """
# Police Checking and Citizen Rights in Pakistan

This document outlines the legal authority of various police forces at check-posts (Nakas) and the rights of citizens.

## 1. Authorized Forces
*   **Traffic Police:** Can only check driving licenses, vehicle registration (Mulkiat), and traffic violations. They cannot search the vehicle without a specific criminal suspicion.
*   **Local Police (Thana):** Authorized to set up Nakas for security. They can check ID cards and search vehicles if they have 'reasonable suspicion' of a crime.
*   **Excise Police:** Primarily check for token tax, professional tax, and illegal number plates.
*   **Motorway/Highway Police:** Jurisdiction is limited to Motorways and National Highways.

## 2. Citizen Rights during Checking
*   **Identification:** You have the right to ask the officer for their name and identification if they are not in uniform or their name tag is missing.
*   **Search Rules:** Searching a vehicle with female passengers requires the presence of a female police officer (Lady Constable).
*   **Respectful Conduct:** Officers are required to remain polite. You cannot be detained indefinitely without a specific charge or suspicion.
*   **Privacy:** Police cannot check your mobile phone or personal messages without a warrant or extreme security emergency.

---
*Disclaimer: Always cooperate with law enforcement for security. If harassed, report to '15' or the relevant IG complaint cell.*
"""
    }
}

def index_legal_knowledge():
    """Trigger vector DB indexing of the legal repository folder."""
    print("RAG: Initializing repository indexing...")
    rag_engine.index_repository()

def get_legal_context(query: str):
    """Semantic lookup using RAG to ground the AI in real data."""
    print(f"RAG: Performing semantic search for: {query}")
    return rag_engine.search(query, k=2)

def get_library_document(topic_key: str):
    """Retrieve full professional document for the Library view."""
    return LEGAL_KNOWLEDGE.get(topic_key.lower())
