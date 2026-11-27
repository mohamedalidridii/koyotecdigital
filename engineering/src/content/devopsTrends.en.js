// English copy for /devops-trends-2027: six DevOps and platform changes for 2027–2028, written for CTOs,
// platform and security leads. Every external date and figure has its primary source in `sources`
// (checked 27 Nov 2026, after two independent reviews). Only the GPU / Kubernetes cost section carries
// our offer: it is the one we deliver. Mirrors devopsTrends.fr.js key for key. Merged into en.js.

const devopsTrendsEn = {
  devopsTrends: {
    header: ["Guide / DevOps 2027–2028", "6 changes · {n} primary sources"],
    audience: "For CTOs, platform and security leads",
    title: "Six changes are close enough to plan for now. Each comes with a date, a cost or a risk you can check this month.",
    byline: { by: "By", name: "Mohamed Ali Dridi", role: "founder of KOYOTEC Engineering", checked: "Information checked on 27 November 2026" },
    intro: [
      "Most infrastructure surprises are announced years in advance. A standard is published, a deadline is set, a cloud provider commits to a date, and the work reaches platform teams later, often as an outage or an audit finding.",
      "For each of the six changes below: what changes, what breaks or costs money, who is exposed, a first check your team can run, and what fixing it involves. The order follows money first, then risk, then lead time.",
    ],
    jump: "See the six changes",
    tableTitle: "The summary: six changes, one table",
    tableCols: ["Change", "Why now", "Signs you are exposed", "First step"],
    tableRows: [
      ["GPU scheduling and costs (Kubernetes DRA)", "DRA stable since Kubernetes 1.34, while GPU bills grow with AI workloads", "Whole GPUs per pod, low SM activity, GPU nodes running at night", "Export two weeks of GPU metrics"],
      ["Identity for workloads and AI agents", "28.65 million secrets leaked on public GitHub in 2025", "Shared API keys, secrets in environment variables", "List every non-human credential and who uses it"],
      ["Post-quantum TLS and shorter certificates", "Public TLS certificates capped at 100 days from 15 March 2027; NIST deprecates classical algorithms after 2030", "Manual renewals, long-lived internal CAs, old load balancers", "Inventory your CAs and every TLS endpoint"],
      ["Admission policies at scale (CEL)", "Kyverno 1.20 stops running legacy ClusterPolicies; MutatingAdmissionPolicy stable since Kubernetes 1.36", "Several webhooks on every API request", "List your webhooks and policy engines"],
      ["Kernel-level runtime security (eBPF)", "More generated and third-party code running in clusters", "No runtime policy, or alerts nobody acts on", "Check that BPF LSM is enabled on your nodes"],
      ["Confidential computing", "Regulated data and model weights moving to public cloud", "\"Encrypted at rest and in transit\" is your only answer", "List the workloads that cannot leave your premises"],
    ],
    offer: {
      kicker: "What we do for you",
      title: "Kubernetes and GPU costs: the change we deliver ourselves.",
      text: "A review with read-only access to your metrics and your bill: how busy your GPUs and nodes really are, what you pay for idle capacity, and a costed plan (right-sizing, autoscaling, GPU sharing with MIG or time-slicing, DRA where your versions and drivers support it). You get a written report with the expected saving per change. If you go ahead, we implement it with you and compare the bill before and after.",
      cta: "Ask for a GPU & Kubernetes cost review",
      note: "Read-only access · written report · reply within 24 business hours",
      links: [
        ["The full guide: Kubernetes GPU costs", "/cloud-costs/kubernetes-gpu"],
        ["The GPU cost case study", "/devops/gpu-cost-optimization"],
      ],
    },
    labels: {
      changes: "What changes",
      breaks: "What breaks or costs money",
      exposed: "Who is exposed",
      check: "A first check",
      fix: "What fixing it involves",
      ours: "We deliver this",
      sources: "Sources",
    },
    sections: [
      {
        id: "gpu",
        ours: true,
        title: "1. GPU scheduling and costs on Kubernetes: stop paying for idle GPUs",
        changes: [
          "Dynamic Resource Allocation (DRA) became stable in Kubernetes 1.34. It is an alternative to the device plugin, close to what StorageClass and persistent volume claims did for storage: a DeviceClass describes a kind of device, drivers publish what each node has in ResourceSlices, and a workload asks for what it needs in a ResourceClaim, with CEL expressions that select devices by attributes and capacity, such as GPU memory. Since Kubernetes 1.37, a DRA driver can also serve classic requests such as nvidia.com/gpu, which eases the move.",
          "The core is stable; splitting one GPU between workloads through DRA is not yet. Partitionable devices are beta since Kubernetes 1.36, and NVIDIA's DRA driver still ships time-slicing, MPS and dynamic MIG as alpha features. For a while, most clusters will combine DRA with MIG or time-slicing configured the classic way.",
        ],
        breaks: [
          "With the classic device plugin, a GPU is a counter: a pod gets whole GPUs or none. A small inference service that needs a few gigabytes of memory still holds a whole card, and GPU nodes are billed by the hour whether their cards are busy or not. The usual \"GPU utilisation\" metric hides it: it says a kernel was running, not how much of the chip was working.",
        ],
        exposed: "Teams running AI inference, training or GPU batch jobs on Kubernetes, especially with many small models or traffic that drops at night.",
        check: [
          "If you already export GPU metrics, pull the last two weeks per node and per pod; if not, start collecting today (DCGM exporter or your provider's metrics).",
          "Look at SM activity and memory used, not only GPU utilisation, and compare the hours your GPU nodes ran with the hours their GPUs were really busy.",
          "Check your Kubernetes version and your GPU driver's DRA support: DRA needs Kubernetes 1.34 or later.",
        ],
        fix: "Group workloads by real need, give small models a right-sized share (MIG or time-slicing with the device plugin today, through DRA where your driver supports it), move whole-GPU jobs to DRA claims, let the autoscaler scale GPU nodes down when they are idle, and compare the bill before and after on the same workload.",
        sources: ["k8s-dra-ga", "k8s-dra-137", "k8s-gates", "nvidia-dra", "dcgm"],
      },
      {
        id: "identity",
        title: "2. Identity for workloads and AI agents: shared keys stop scaling",
        changes: [
          "GitGuardian counted 28.65 million new hardcoded secrets on public GitHub in 2025, up 34% on 2024, and 1.27 million leaks tied to AI services, up 81%. AI agents add to the problem: one agent can call many internal APIs, and it is easy to give it the same long-lived key as the service that runs it.",
        ],
        breaks: [
          "If five agents share one API key, you cannot tell which one made a bad change, and you cannot revoke one without stopping all five. A leaked long-lived key keeps working until someone notices: GitGuardian found that 64% of the secrets that were valid in 2022 could still be used in January 2026.",
        ],
        exposed: "Any team running AI agents, CI/CD pipelines or microservices that authenticate with static keys, tokens in environment variables or shared service accounts.",
        check: [
          "Count your non-human credentials (API keys, service-account keys, tokens), and note for each one which workloads use it and when it was last rotated.",
          "Find the credentials that more than one workload or agent shares.",
        ],
        fix: "Give every workload its own short-lived, verifiable identity: cloud-native workload identity where it exists, or SPIFFE/SPIRE (a CNCF graduated project) across clouds and on-premises. Agents then ask a broker for narrow, short-lived access instead of holding database secrets. The IETF WIMSE working group is standardising workload identity tokens and token exchange across systems.",
        sources: ["gitguardian", "spiffe", "wimse"],
      },
      {
        id: "pqc",
        title: "3. Post-quantum TLS and shorter certificates: key exchange first, then signatures",
        changes: [
          "NIST published the final version of IR 8547 on 27 October 2026. It deprecates the classical public-key algorithms after 2030 and disallows them under NIST standards after 2035, whatever the key size, both for signatures (RSA, ECDSA, EdDSA) and for key establishment (ECDH, DH, RSA). NIST expects key establishment to move first, because traffic recorded today can be decrypted later (\"harvest now, decrypt later\").",
          "Key exchange is already moving: hybrid ML-KEM key exchange (FIPS 203) is on by default in Chrome and offered by cloud load balancers. Signatures follow: RFC 9881 (October 2025) defines ML-DSA in X.509 certificates, and Google Cloud and Cloudflare target 2029 for a full post-quantum migration. On the public web, Chrome does not plan to accept post-quantum X.509 certificates; it is preparing a separate quantum-resistant root store based on Merkle Tree Certificates, with CA requirements due in Q3 2027.",
          "Europe and the UK have their own dates: the EU's coordinated roadmap (June 2025) asks member states to start by the end of 2026 and to protect high-risk use cases by the end of 2030; the UK NCSC sets 2028 for discovery and planning, 2031 for priority migrations and 2035 for completion.",
        ],
        breaks: [
          "Size. The larger hybrid ClientHello is what has broken some middleboxes so far. Certificates come next: in a private-PKI or mutual-TLS handshake (two certificates plus the handshake signature), the public keys and signatures grow from about 350 bytes with ECDSA P-256 to about 10 KB with ML-DSA-44 and 14 KB with ML-DSA-65 (our calculation from the sizes in FIPS 204). Past about 14 KB the server's first flight no longer fits TCP's initial congestion window and the handshake needs an extra round trip; Cloudflare saw some clients fail above about 10 KB.",
          "Lifetimes. Public TLS certificates are capped at 200 days since 15 March 2026, 100 days from 15 March 2027 and 47 days from 15 March 2029 (CA/Browser Forum ballot SC-081v3); public code-signing certificates at 460 days since 1 March 2026 (CSC-31). Manual renewal stops being an option. A private CA issued in 2027 with a 10-year validity is still trusted in 2037, past NIST's 2035 date.",
        ],
        exposed: "Companies with internal PKIs, device fleets, mutual TLS between services, certificate pinning in apps or scripts, renewals still done by hand, and suppliers to governments with their own deadlines.",
        check: [
          "List every CA you run, with its key algorithm, key size and expiry date.",
          "List the components that terminate or inspect TLS (load balancers, API gateways, proxies, firewalls, service meshes) and confirm that each one completes a handshake with a current Chrome and negotiates X25519MLKEM768.",
          "Find the certificates still renewed by hand, and search your code and configuration for pinned keys or certificate hashes.",
        ],
        fix: "Crypto-agility first: automated renewal everywhere, certificates and trust stores you can rotate without a release, short lifetimes, hybrid key exchange enabled where your stack supports it, and a test environment that issues ML-DSA certificates (alone or next to ECDSA) to find the components that fail before 2030.",
        sources: ["nist", "fips203", "chrome-kem", "rfc9881", "fips204", "cf-sizes", "sc081", "cab", "chrome-mtc", "google", "cloudflare", "eu", "ncsc"],
      },
      {
        id: "cel",
        title: "4. Admission policies at scale: from webhooks to CEL",
        changes: [
          "Agents and AI tools can send many more changes to Kubernetes than people do, and every admission webhook adds a network call to every matching API request. Kubernetes now evaluates policies inside the API server with CEL: ValidatingAdmissionPolicy has been stable since 1.30 and MutatingAdmissionPolicy since 1.36.",
          "Kyverno moved the same way. Its CEL-based policy types became stable in Kyverno 1.17 (February 2026), which deprecated the legacy ClusterPolicy, and Kyverno 1.20 no longer runs ClusterPolicy, Policy or CleanupPolicy resources. A cluster that upgrades Kyverno without migrating stops enforcing those policies.",
        ],
        breaks: [
          "A slow or unavailable webhook slows down or blocks deployments for the whole cluster, depending on its failure policy. A policy engine upgrade can also switch off rules you rely on without anyone noticing.",
        ],
        exposed: "Clusters with several admission webhooks (policy engines, service mesh injection, image verification), Kyverno users still on ClusterPolicy, and teams moving to GitOps or agent-driven changes.",
        check: [
          "List your validating and mutating webhooks and their failure policy (Fail or Ignore).",
          "If you run Kyverno, list its legacy policies (kubectl get clusterpolicy -A) and plan their migration before you upgrade to 1.20.",
          "Look at the API server's admission latency metrics during a busy deployment window.",
        ],
        fix: "Move simple rules to native CEL policies, migrate Kyverno policies to its CEL-based types, keep webhooks for what CEL cannot do (external lookups, signature verification), run the same policies in CI so changes fail before they reach the cluster, and load-test admission before you rely on it.",
        sources: ["k8s-vap", "k8s-map", "kyverno-117", "kyverno-upgrade"],
      },
      {
        id: "ebpf",
        title: "5. Kernel-level runtime security with eBPF: control what runs in your containers",
        changes: [
          "More of the code in your clusters is written or pulled in by tools: AI coding assistants, generated infrastructure, third-party images. Runtime security is moving into the Linux kernel with eBPF, which can observe and block system calls and network connections from one agent per node (usually a DaemonSet), with lower overhead than user-space monitoring.",
        ],
        breaks: [
          "A container that starts an unexpected process or opens an unexpected outbound connection is often seen only in logs, after the fact, or not at all if nothing watches the node.",
        ],
        exposed: "Multi-tenant clusters, platforms that run customer or generated code, and regulated workloads that must prove their runtime controls.",
        check: [
          "Check that BPF LSM is enabled on your nodes: cat /sys/kernel/security/lsm should list bpf (BPF LSM has been in the kernel since Linux 5.7).",
          "List which clusters have a runtime policy today, and whether it only alerts or also blocks.",
        ],
        fix: "Start with observation (Tetragon or Falco). Falco only detects and alerts, so enforce with Tetragon or BPF LSM policies, starting with the rules that never fire on legitimate activity, one namespace at a time and after staging.",
        sources: ["linux57", "lsm", "tetragon", "falco"],
      },
      {
        id: "confidential",
        title: "6. Confidential computing: protecting data while it is processed",
        changes: [
          "Encryption at rest and in transit is standard; data and model weights in memory are protected by neither. Confidential computing runs workloads in hardware-isolated environments (AMD SEV-SNP, Intel TDX, NVIDIA confidential computing on recent GPUs) and lets a key service check, through remote attestation, that the expected code is running before it releases a secret.",
        ],
        breaks: [
          "This is mostly a blocker rather than a breakage: banks, insurers, healthcare and defence often cannot move certain workloads to public cloud without it. Running it also changes operations: you need known reference measurements for every image, which reproducible builds make verifiable, and key release depends on attestation working.",
        ],
        exposed: "Regulated industries, companies that host proprietary models, and anyone whose compliance team has said no to a cloud migration because of data in use.",
        check: [
          "List the workloads your compliance or security team keeps on-premises today, and why.",
          "Check which confidential VM or GPU options your cloud provider offers in your Regions.",
        ],
        fix: "Pick one workload, build its image reproducibly in CI, run it on confidential instances, and wire the key release to attestation. The Confidential Containers project (CNCF Incubating) brings the same model to Kubernetes pods.",
        sources: ["coco"],
      },
    ],
    start: {
      title: "Where to start",
      paras: [
        "Start the six first checks this week (the GPU one needs two weeks of metrics) and write the results in one table: which change applies to you, how exposed you are, and the date that matters. The usual order follows money, risk and lead time: idle GPUs cost money every hour they run, shared keys are a risk today, and post-quantum work needs the longest lead time because certificates and devices stay in service for years.",
      ],
    },
    sources: {
      "k8s-dra-ga": ["Kubernetes v1.34: DRA has graduated to GA", "https://kubernetes.io/blog/2025/09/01/kubernetes-v1-34-dra-updates/"],
      "k8s-dra-137": ["Kubernetes v1.37: DRA updates (extended resource support GA)", "https://kubernetes.io/blog/2026/09/03/kubernetes-v1-37-dra-updates/"],
      "k8s-gates": ["Kubernetes feature gates (DRA partitionable devices)", "https://kubernetes.io/docs/reference/command-line-tools-reference/feature-gates/"],
      "nvidia-dra": ["NVIDIA DRA driver for GPUs: feature gates", "https://dra-driver-nvidia-gpu.sigs.k8s.io/docs/reference/feature-gates/"],
      dcgm: ["NVIDIA DCGM: profiling metrics", "https://docs.nvidia.com/datacenter/dcgm/latest/learn/modules/profiling.html"],
      gitguardian: ["GitGuardian: The State of Secrets Sprawl 2026", "https://blog.gitguardian.com/the-state-of-secrets-sprawl-2026/"],
      spiffe: ["SPIFFE and SPIRE", "https://spiffe.io/"],
      wimse: ["IETF WIMSE working group (Workload Identity in Multi-System Environments)", "https://datatracker.ietf.org/wg/wimse/about/"],
      nist: ["NIST IR 8547 (final, 27 Oct 2026): Transition to Post-Quantum Cryptography Standards", "https://csrc.nist.gov/pubs/ir/8547/final"],
      fips203: ["FIPS 203: Module-Lattice-Based Key-Encapsulation Mechanism (ML-KEM)", "https://csrc.nist.gov/pubs/fips/203/final"],
      "chrome-kem": ["Google Security Blog: ML-KEM key exchange in Chrome", "https://security.googleblog.com/2024/09/a-new-path-for-kyber-on-web.html"],
      rfc9881: ["RFC 9881: ML-DSA algorithm identifiers for X.509 (Oct 2025)", "https://www.rfc-editor.org/info/rfc9881"],
      fips204: ["FIPS 204: Module-Lattice-Based Digital Signature Standard (key and signature sizes)", "https://csrc.nist.gov/pubs/fips/204/final"],
      "cf-sizes": ["Cloudflare: sizing up post-quantum signatures", "https://blog.cloudflare.com/sizing-up-post-quantum-signatures/"],
      sc081: ["CA/Browser Forum ballot SC-081v3: shorter TLS certificate validity", "https://cabforum.org/2025/04/11/ballot-sc081v3-introduce-schedule-of-reducing-validity-and-data-reuse-periods/"],
      cab: ["CA/Browser Forum ballot CSC-31: code signing maximum validity of 460 days", "https://cabforum.org/2025/11/17/ballot-csc-31-maximum-validity-reduction"],
      "chrome-mtc": ["Google: cultivating a robust and efficient quantum-safe HTTPS (Feb 2026)", "https://blog.google/security/cultivating-a-robust-and-efficient-quantum-safe-https/"],
      google: ["Google Cloud: post-quantum cryptography roadmap", "https://cloud.google.com/blog/products/identity-security/pqc-in-plaintext-google-clouds-post-quantum-cryptography-roadmap"],
      cloudflare: ["Cloudflare: why we cannot wait for better post-quantum signature algorithms", "https://blog.cloudflare.com/ml-dsa-will-have-to-do/"],
      eu: ["European Commission: post-quantum cryptography and the coordinated roadmap", "https://digital-strategy.ec.europa.eu/en/policies/post-quantum-cryptography"],
      ncsc: ["UK NCSC: timelines for migration to post-quantum cryptography", "https://www.ncsc.gov.uk/guidance/pqc-migration-timelines"],
      "k8s-vap": ["Kubernetes documentation: Validating Admission Policy", "https://kubernetes.io/docs/reference/access-authn-authz/validating-admission-policy/"],
      "k8s-map": ["Kubernetes documentation: Mutating Admission Policy", "https://kubernetes.io/docs/reference/access-authn-authz/mutating-admission-policy/"],
      "kyverno-117": ["CNCF: announcing Kyverno 1.17", "https://www.cncf.io/blog/2026/02/18/announcing-kyverno-1-17/"],
      "kyverno-upgrade": ["Kyverno documentation: upgrading (1.20 and legacy policies)", "https://kyverno.io/docs/installation/upgrading/"],
      linux57: ["Kernel Newbies: Linux 5.7 (BPF LSM)", "https://kernelnewbies.org/Linux_5.7"],
      lsm: ["Linux kernel documentation: LSM BPF programs", "https://docs.kernel.org/bpf/prog_lsm.html"],
      tetragon: ["Tetragon documentation (enforcement)", "https://tetragon.io/docs/"],
      falco: ["Falco documentation (detection and alerts)", "https://falco.org/docs/"],
      coco: ["Confidential Containers (CNCF)", "https://confidentialcontainers.org/"],
    },
    articleDescription:
      "DevOps trends for 2027–2028: Kubernetes GPU costs (DRA), workload identity, post-quantum TLS, CEL admission policies, eBPF runtime security and confidential computing.",
  },

  trendsFaq: {
    header: ["FAQ", "Planning for 2027–2028"],
    title: "Questions before you plan",
    items: [
      {
        question: "Do we need to act on post-quantum cryptography before a regulator requires it?",
        answer: [
          "The NIST dates are not a law for private companies, but they shape what vendors, auditors and large customers expect, and Europe and the UK have published their own timelines. Cloud providers set their own dates too (Google Cloud and Cloudflare target 2029), and Chrome is preparing a separate quantum-resistant root store from 2027. The practical reason to start now is lead time: certificates and devices you deploy in 2027 will still be in service after 2030.",
        ],
      },
      {
        question: "Can we use DRA on a managed Kubernetes service?",
        answer: [
          "You need Kubernetes 1.34 or later and a DRA driver for your devices. Managed services enable DRA and its newer features at different times, and GPU sharing through DRA is still beta or alpha, so check your provider's release notes and your GPU driver's documentation. MIG, time-slicing and autoscaling already cut GPU costs without DRA.",
        ],
      },
      {
        question: "What does the GPU & Kubernetes cost review include?",
        answer: [
          "We read your GPU and cluster metrics and your bill with read-only access, show where capacity is paid for but idle, and propose the changes (right-sizing, node pools, autoscaling, GPU sharing, DRA claims) with the expected saving per change. You get a written report. If you go ahead, we implement the changes with you and compare the bill before and after.",
        ],
      },
      {
        question: "Do you also deliver the other five changes?",
        answer: [
          "Not as a service today. Post-quantum PKI, workload identity, eBPF runtime security, admission policies and confidential computing are in this guide because they affect the platforms we work on; the first checks are a fair starting point for your team or a specialist.",
        ],
      },
      {
        question: "How did you check the dates and figures?",
        answer: [
          "Every external date and figure links to its primary source in the section that uses it (NIST, IETF, CA/Browser Forum, Kubernetes, Kyverno, the vendors' own publications), checked on 27 November 2026. Two things are ours: the handshake sizes, calculated from the key and signature sizes in FIPS 204, and the two weeks of GPU metrics we recommend before changing anything.",
        ],
      },
    ],
  },
};

export default devopsTrendsEn;
