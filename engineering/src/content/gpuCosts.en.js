// English copy for /cloud-costs/kubernetes-gpu: the evergreen guide to Kubernetes GPU costs (measure, share,
// scale down) and the GPU & Kubernetes cost review it sells. Every technical claim has its primary source in
// `sources` (checked 27 Nov 2026). The calculator only does arithmetic on the reader's own inputs.
// Mirrors gpuCosts.fr.js key for key. Merged into en.js.

const gpuCostsEn = {
  gpuCosts: {
    header: ["Guide / GPU costs", "{n} primary sources"],
    audience: "DevOps · for teams running GPUs on Kubernetes",
    title: "Most Kubernetes GPU clusters pay for whole GPUs and use a fraction of them.",
    byline: { by: "By", name: "Mohamed Ali Dridi", role: "founder of KOYOTEC Engineering", checked: "Information checked on 27 November 2026" },
    intro: [
      "A GPU node costs the same per hour whether its cards are busy or idle. On Kubernetes, the default way of requesting GPUs (whole cards, counted like integers) and the default way of watching them (a utilisation figure that only says a kernel was running) make idle capacity easy to pay for and hard to see.",
      "This guide covers how to measure it, the four ways to share a GPU and their limits, what DRA changes compared with the device plugin, and how to switch GPU nodes off when nothing runs.",
    ],
    labels: { sources: "Sources" },
    why: {
      title: "Why GPU bills grow on Kubernetes",
      items: [
        "Whole GPUs per pod. With the device plugin, a pod asks for nvidia.com/gpu: 1 and gets a whole card, even if its model needs a few gigabytes of the card's memory.",
        "Replicas \"to be safe\". Each replica of an inference service holds its own GPU, sized for peak traffic all day long.",
        "Nodes that never stop. GPU node pools often keep their minimum size at night and at weekends, when traffic is a fraction of the day's.",
        "A metric that hides it. GPU utilisation (DCGM_FI_DEV_GPU_UTIL, the figure nvidia-smi shows) says how often a kernel was running, not how much of the chip was working: a GPU can show 100% while most of its streaming multiprocessors (SMs) wait.",
      ],
      sources: ["dcgm"],
    },
    measure: {
      title: "Measure first: three numbers per GPU",
      cols: ["Metric", "What it tells you", "Watch for"],
      rows: [
        ["SM activity (DCGM_FI_PROF_SM_ACTIVE)", "The share of time the GPU's streaming multiprocessors had work", "Low values on GPUs that look busy in nvidia-smi"],
        ["Memory used (DCGM_FI_DEV_FB_USED)", "How much of the card's memory each workload really needs", "Models using a small part of a large card: candidates for MIG"],
        ["GPU-hours vs busy hours", "The hours your GPU nodes ran, compared with the hours their GPUs did real work", "Nodes running at night and at weekends with little activity"],
      ],
      paras: [
        "Collect them for two weeks, per node and per pod, with the DCGM exporter or your provider's GPU metrics, before changing anything. Once GPUs are shared, check that your exporter still attributes metrics to each pod: NVIDIA documents limits for time-slicing and MPS.",
      ],
      sources: ["dcgm", "gpu-sharing"],
    },
    calc: {
      title: "What idle GPUs cost you",
      inputs: "Your figures",
      fields: {
        gpus: "GPUs running",
        price: "Price per GPU-hour (USD)",
        hours: "Hours per day they run",
        activity: "Average SM activity (%)",
        target: "Target activity after packing (%)",
      },
      priceNote: "Use your own price: on-demand, reserved or committed-use. The default values are only an example.",
      spend: "GPU spend",
      idle: "of it pays for idle capacity",
      needed: "GPUs needed at the target activity",
      saving: "Possible saving",
      perMonth: "/ month",
      perYear: "per year",
      note: "An estimate from your inputs, not a promise: real packing is limited by memory, latency targets and how your models load. The review measures it on your cluster.",
      cta: "Ask for a GPU & Kubernetes cost review",
    },
    share: {
      title: "Four ways to share a GPU",
      cols: ["Method", "Isolation", "Best for", "Limits and maturity"],
      rows: [
        ["MIG (Multi-Instance GPU)", "Hardware: memory and compute are split", "Production models that need a guaranteed share", "NVIDIA Ampere generation and newer data-centre GPUs; up to 7 instances on A100, H100 and newer, 4 on A30; fixed profiles"],
        ["Time-slicing", "None: no memory or fault isolation between the workloads", "Development, notebooks, batch jobs", "One workload can use all the memory or crash its neighbours"],
        ["MPS (Multi-Process Service)", "Partial: processes run on the GPU at the same time", "Many small inference processes", "Experimental in the NVIDIA device plugin; limits on multi-GPU requests and per-pod metrics"],
        ["DRA (Dynamic Resource Allocation)", "Depends on the driver and the device", "Choosing devices by attributes and capacity; whole-GPU jobs", "Core stable since Kubernetes 1.34; partitionable devices beta since 1.36; sharing features of NVIDIA's DRA driver still alpha"],
      ],
      paras: [
        "MIG and time-slicing can be combined: time-slicing on top of MIG instances shares each slice further. In practice, production inference goes on MIG, and development and batch work on time-slicing.",
      ],
      sources: ["mig", "gpu-sharing", "device-plugin", "k8s-gates", "nvidia-dra"],
    },
    dra: {
      title: "DRA vs the device plugin",
      items: [
        "Counting vs claiming. The device plugin advertises a number (nvidia.com/gpu: 4). DRA publishes each device with its attributes and capacity in ResourceSlices, and a pod asks for what it needs in a ResourceClaim.",
        "Choosing devices. A DeviceClass and CEL expressions can require, for example, a GPU with enough memory or a given model, instead of steering pods with node labels and taints.",
        "Sharing. Several pods can share one ResourceClaim, and partitionable devices (beta since Kubernetes 1.36) let a GPU be split on demand. With NVIDIA's DRA driver, time-slicing, MPS and dynamic MIG are still alpha features.",
        "Moving over. Since Kubernetes 1.37, a DRA driver can serve classic extended-resource requests such as nvidia.com/gpu, so existing workloads can keep their manifests while the cluster moves to DRA.",
      ],
      sources: ["k8s-dra-docs", "k8s-dra-ga", "k8s-dra-137"],
    },
    scale: {
      title: "Switch GPU nodes off when nothing runs",
      items: [
        "Put GPU workloads on their own node pools, tainted so that CPU pods don't land there and keep the nodes awake.",
        "Let the autoscaler (Cluster Autoscaler or Karpenter) remove idle GPU nodes, and lower the minimum outside business hours where latency allows it.",
        "Measure how long a model takes to be ready on a new node (image pull and weight loading): it decides how low the minimum can go for latency-sensitive services.",
        "Move fine-tuning and batch jobs to the hours when inference traffic is low, so they reuse capacity instead of adding nodes.",
      ],
    },
    offer: {
      kicker: "What we do for you",
      title: "A GPU & Kubernetes cost review, then the changes if you want them.",
      text: "With read-only access to your metrics and your bill, we measure how busy your GPUs and nodes really are, show what you pay for idle capacity, and give you a costed plan: right-sizing, autoscaling, GPU sharing with MIG or time-slicing, and DRA where your versions and drivers support it. You get a written report with the expected saving per change. If you go ahead, we implement it with you and compare the bill before and after.",
      cta: "Ask for a GPU & Kubernetes cost review",
      note: "Read-only access · written report · reply within 24 business hours",
      links: [
        ["The GPU cost case study", "/devops/gpu-cost-optimization"],
        ["DevOps trends 2027–2028", "/devops-trends-2027"],
      ],
    },
    sources: {
      dcgm: ["NVIDIA DCGM: profiling metrics", "https://docs.nvidia.com/datacenter/dcgm/latest/learn/modules/profiling.html"],
      "gpu-sharing": ["NVIDIA GPU Operator: time-slicing GPUs in Kubernetes", "https://docs.nvidia.com/datacenter/cloud-native/gpu-operator/latest/gpu-sharing.html"],
      mig: ["NVIDIA MIG user guide: supported GPUs", "https://docs.nvidia.com/datacenter/tesla/mig-user-guide/latest/supported-gpus.html"],
      "device-plugin": ["NVIDIA device plugin for Kubernetes", "https://github.com/NVIDIA/k8s-device-plugin"],
      "k8s-gates": ["Kubernetes feature gates (DRA partitionable devices)", "https://kubernetes.io/docs/reference/command-line-tools-reference/feature-gates/"],
      "nvidia-dra": ["NVIDIA DRA driver for GPUs: feature gates", "https://dra-driver-nvidia-gpu.sigs.k8s.io/docs/reference/feature-gates/"],
      "k8s-dra-docs": ["Kubernetes documentation: Dynamic Resource Allocation", "https://kubernetes.io/docs/concepts/resource-management/dynamic-resource-allocation/"],
      "k8s-dra-ga": ["Kubernetes v1.34: DRA has graduated to GA", "https://kubernetes.io/blog/2025/09/01/kubernetes-v1-34-dra-updates/"],
      "k8s-dra-137": ["Kubernetes v1.37: DRA updates (extended resource support GA)", "https://kubernetes.io/blog/2026/09/03/kubernetes-v1-37-dra-updates/"],
    },
    articleDescription:
      "How to cut Kubernetes GPU costs: measure idle GPUs with DCGM, share them with MIG, time-slicing or DRA, and scale GPU nodes down, with an idle-cost calculator.",
  },

  gpuFaq: {
    header: ["FAQ", "GPU costs"],
    title: "Questions before you change anything",
    items: [
      {
        question: "Which GPUs support MIG?",
        answer: [
          "Data-centre GPUs from the NVIDIA Ampere generation onwards (compute capability 8.0 and newer), such as A100, H100, H200 and Blackwell parts, with up to seven instances; the A30 supports four. Check NVIDIA's MIG user guide for your exact model and its profiles.",
        ],
      },
      {
        question: "Is time-slicing safe in production?",
        answer: [
          "It has no memory or fault isolation between the workloads that share a GPU, so one of them can use all the memory or crash the others. It suits development, notebooks and batch jobs; production models that need a guaranteed share are better on MIG.",
        ],
      },
      {
        question: "Do we need DRA to cut GPU costs?",
        answer: [
          "No. Measuring, right-sizing, MIG, time-slicing and scaling idle nodes down all work with the device plugin today. DRA makes device selection declarative, and it will make sharing easier as its features mature.",
        ],
      },
      {
        question: "Why does nvidia-smi show 100% when the GPU is mostly idle?",
        answer: [
          "Its utilisation figure measures how often a kernel was running during the sample period, not how much of the chip was in use. SM activity (DCGM_FI_PROF_SM_ACTIVE) and memory use give a truer picture of what a workload needs.",
        ],
      },
      {
        question: "What does the GPU & Kubernetes cost review include?",
        answer: [
          "We read your GPU and cluster metrics and your bill with read-only access, show where capacity is paid for but idle, and propose the changes (right-sizing, node pools, autoscaling, GPU sharing, DRA claims) with the expected saving per change. You get a written report. If you go ahead, we implement the changes with you and compare the bill before and after.",
        ],
      },
    ],
  },
};

export default gpuCostsEn;
