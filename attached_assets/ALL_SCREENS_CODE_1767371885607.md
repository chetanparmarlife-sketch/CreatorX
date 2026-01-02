# CreatorX — All screens code (screen-wise)

This file concatenates every screen's `index.html` with clear headers so you can search in Cursor.

Use the project `index.html` to preview screens.



---

## SCREEN: accepted_campaigns_dashboard

Path: `screens/accepted_campaigns_dashboard/index.html`

```html
<!DOCTYPE html>
<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Creator Profile &amp; Settings</title>
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#1337ec",
                        "background-light": "#f6f6f8",
                        "background-dark": "#000000",
                        "card-dark": "#121212", 
                        "surface-dark": "#1E1E1E",
                        "border-dark": "#272727",
                    },
                    fontFamily: {
                        "display": ["Plus Jakarta Sans", "sans-serif"]
                    },
                    borderRadius: {
                        "DEFAULT": "0.25rem", 
                        "lg": "0.5rem", 
                        "xl": "0.75rem", 
                        "2xl": "1rem",
                        "full": "9999px"
                    },
                },
            },
        }
    </script>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
    .toggle-checkbox:checked {
        right: 0;
        border-color: #1337ec;
    }
    .toggle-checkbox:checked + .toggle-label {
        background-color: #1337ec;
    }
</style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="font-display bg-background-light dark:bg-background-dark text-slate-900 dark:text-white antialiased overflow-x-hidden">
<div class="relative flex min-h-screen w-full flex-col max-w-md mx-auto shadow-2xl overflow-hidden bg-white dark:bg-background-dark">
<header class="flex items-center px-4 py-4 justify-between bg-white dark:bg-background-dark sticky top-0 z-50 border-b border-slate-100 dark:border-border-dark">
<div class="flex items-center gap-2">
<button class="flex items-center justify-center p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
<span class="material-symbols-outlined text-[24px]">arrow_back</span>
</button>
</div>
<h1 class="text-lg font-bold leading-tight tracking-tight flex-1 text-center pr-2">Profile &amp; Settings</h1>
<div class="flex items-center justify-end gap-2">
<button class="text-primary font-semibold text-sm px-2">Save</button>
</div>
</header>
<main class="flex-1 overflow-y-auto pb-24">
<section class="flex flex-col items-center pt-8 pb-6 px-4">
<div class="relative mb-4 group">
<div class="size-24 rounded-full p-1 bg-gradient-to-br from-primary to-purple-500">
<div class="size-full rounded-full bg-white dark:bg-card-dark overflow-hidden border-2 border-white dark:border-background-dark">
<img alt="Creator profile" class="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDI5wpt3VVTr0f_ypHKyXPkIdN4VOTxRbl0hFVFVkZT4Hu85bc0UYNeouW30zQA9aZrKmGWssudljjdbMvdwkBBd_5DIIbiThyKvzwv-CqAFl7WuUxH0xzTQ5nisEBk7T59xgcLOar0CssWucPkyYCyIjz0R04j1ZsHqn9TK08wwX7jPJqKPDZ_ivkqfwvyteIZZGnQlAOOFurNI6054Z_M3Kb7zvK6GOCzqCRHcXsn7FyH5va77gSRoPzNJ6-3qc6bzGqFT3oymSQ"/>
</div>
</div>
<button class="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full shadow-lg border-2 border-white dark:border-background-dark hover:bg-blue-600 transition-colors">
<span class="material-symbols-outlined text-[18px]">edit</span>
</button>
</div>
<h2 class="text-xl font-bold text-slate-900 dark:text-white">Alex Morgan</h2>
<p class="text-sm text-slate-500 dark:text-slate-400">@alexcreators</p>
</section>
<section class="px-4 mb-2">
<div class="bg-white dark:bg-card-dark rounded-2xl p-4 border border-slate-200 dark:border-border-dark shadow-sm">
<div class="flex items-center justify-between mb-4">
<h3 class="text-sm font-bold uppercase tracking-wider text-slate-400">Personal Info</h3>
</div>
<div class="space-y-4">
<div class="group">
<label class="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Full Name</label>
<input class="w-full bg-slate-50 dark:bg-surface-dark border-none rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary placeholder-slate-400 text-slate-900 dark:text-white" type="text" value="Alex Morgan"/>
</div>
<div class="group">
<label class="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Bio</label>
<textarea class="w-full bg-slate-50 dark:bg-surface-dark border-none rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary placeholder-slate-400 text-slate-900 dark:text-white resize-none" rows="3">Digital creator focused on lifestyle, tech, and modern living. Creating content that inspires.</textarea>
</div>
<div class="group">
<label class="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Email Address</label>
<div class="relative">
<span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
<span class="material-symbols-outlined text-slate-400 text-[18px]">mail</span>
</span>
<input class="w-full pl-10 bg-slate-50 dark:bg-surface-dark border-none rounded-xl py-3 text-sm font-medium focus:ring-2 focus:ring-primary placeholder-slate-400 text-slate-900 dark:text-white" type="email" value="alex@creatorx.com"/>
</div>
</div>
</div>
</div>
</section>
<section class="px-4 my-6">
<h3 class="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3 px-1">Connected Accounts</h3>
<div class="bg-white dark:bg-card-dark rounded-2xl border border-slate-200 dark:border-border-dark shadow-sm overflow-hidden">
<div class="flex items-center justify-between p-4 border-b border-slate-100 dark:border-border-dark">
<div class="flex items-center gap-3">
<div class="size-10 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 p-[1px]">
<div class="size-full rounded-full bg-white dark:bg-card-dark flex items-center justify-center">
<span class="material-symbols-outlined text-[20px] bg-clip-text text-transparent bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 font-bold">camera_alt</span>
</div>
</div>
<div>
<p class="font-semibold text-sm">Instagram</p>
<p class="text-xs text-slate-500">Connected as @alexcreators</p>
</div>
</div>
<button class="text-xs font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">Disconnect</button>
</div>
<div class="flex items-center justify-between p-4 border-b border-slate-100 dark:border-border-dark">
<div class="flex items-center gap-3">
<div class="size-10 rounded-full bg-black dark:bg-white flex items-center justify-center text-white dark:text-black">
<span class="font-bold text-xs">Tk</span>
</div>
<div>
<p class="font-semibold text-sm">TikTok</p>
<p class="text-xs text-slate-500">Connected as @alexcreators</p>
</div>
</div>
<button class="text-xs font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">Disconnect</button>
</div>
<div class="flex items-center justify-between p-4">
<div class="flex items-center gap-3">
<div class="size-10 rounded-full bg-red-600 flex items-center justify-center text-white">
<span class="material-symbols-outlined text-[20px]">play_arrow</span>
</div>
<div>
<p class="font-semibold text-sm">YouTube</p>
<p class="text-xs text-slate-500">Not connected</p>
</div>
</div>
<button class="text-xs font-bold text-primary hover:text-blue-600">Connect</button>
</div>
</div>
</section>
<section class="px-4 mb-6">
<h3 class="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3 px-1">Creator Toolkit</h3>
<div class="bg-white dark:bg-card-dark rounded-2xl border border-slate-200 dark:border-border-dark shadow-sm overflow-hidden divide-y divide-slate-100 dark:divide-border-dark">
<button class="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-surface-dark transition-colors text-left group">
<div class="flex items-center gap-3">
<div class="p-2 rounded-lg bg-pink-500/10 text-pink-500">
<span class="material-symbols-outlined text-[20px]">redeem</span>
</div>
<div class="flex flex-col">
<span class="font-medium text-sm text-slate-900 dark:text-white">Refer and Earn</span>
<span class="text-xs text-slate-500 dark:text-slate-400">Invite creators &amp; earn bonuses</span>
</div>
</div>
<span class="material-symbols-outlined text-slate-400 text-[20px] group-hover:text-primary transition-colors">chevron_right</span>
</button>
<button class="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-surface-dark transition-colors text-left group">
<div class="flex items-center gap-3">
<div class="p-2 rounded-lg bg-orange-500/10 text-orange-500">
<span class="material-symbols-outlined text-[20px]">bookmark</span>
</div>
<div class="flex flex-col">
<span class="font-medium text-sm text-slate-900 dark:text-white">Saved Campaigns</span>
<span class="text-xs text-slate-500 dark:text-slate-400">View your bookmarked briefs</span>
</div>
</div>
<span class="material-symbols-outlined text-slate-400 text-[20px] group-hover:text-primary transition-colors">chevron_right</span>
</button>
<button class="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-surface-dark transition-colors text-left group">
<div class="flex items-center gap-3">
<div class="p-2 rounded-lg bg-cyan-500/10 text-cyan-500">
<span class="material-symbols-outlined text-[20px]">folder_open</span>
</div>
<div class="flex flex-col">
<span class="font-medium text-sm text-slate-900 dark:text-white">My Docs</span>
<span class="text-xs text-slate-500 dark:text-slate-400">Contracts, Tax forms &amp; Invoices</span>
</div>
</div>
<span class="material-symbols-outlined text-slate-400 text-[20px] group-hover:text-primary transition-colors">chevron_right</span>
</button>
</div>
</section>
<section class="px-4 mb-6">
<h3 class="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3 px-1">App Preferences</h3>
<div class="bg-white dark:bg-card-dark rounded-2xl border border-slate-200 dark:border-border-dark shadow-sm overflow-hidden divide-y divide-slate-100 dark:divide-border-dark">
<div class="flex items-center justify-between p-4">
<div class="flex items-center gap-3">
<div class="p-2 rounded-lg bg-blue-500/10 text-blue-500">
<span class="material-symbols-outlined text-[20px]">notifications</span>
</div>
<div class="flex flex-col">
<span class="font-medium text-sm">Push Notifications</span>
<span class="text-xs text-slate-500">Campaign updates &amp; messages</span>
</div>
</div>
<div class="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
<input checked="" class="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer border-slate-300 dark:border-slate-600 transition-all duration-300 ease-in-out" id="toggle1" name="toggle1" type="checkbox"/>
<label class="toggle-label block overflow-hidden h-5 rounded-full bg-slate-300 dark:bg-slate-700 cursor-pointer transition-colors duration-300 ease-in-out" for="toggle1"></label>
</div>
</div>
<div class="flex items-center justify-between p-4">
<div class="flex items-center gap-3">
<div class="p-2 rounded-lg bg-purple-500/10 text-purple-500">
<span class="material-symbols-outlined text-[20px]">mail</span>
</div>
<div class="flex flex-col">
<span class="font-medium text-sm">Email Digest</span>
<span class="text-xs text-slate-500">Weekly earnings summary</span>
</div>
</div>
<div class="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
<input class="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer border-slate-300 dark:border-slate-600 transition-all duration-300 ease-in-out right-auto left-0" id="toggle2" name="toggle2" type="checkbox"/>
<label class="toggle-label block overflow-hidden h-5 rounded-full bg-slate-300 dark:bg-slate-700 cursor-pointer transition-colors duration-300 ease-in-out" for="toggle2"></label>
</div>
</div>
<div class="flex items-center justify-between p-4">
<div class="flex items-center gap-3">
<div class="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
<span class="material-symbols-outlined text-[20px]">visibility</span>
</div>
<div class="flex flex-col">
<span class="font-medium text-sm">Profile Visibility</span>
<span class="text-xs text-slate-500">Visible to brands</span>
</div>
</div>
<div class="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
<input checked="" class="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer border-slate-300 dark:border-slate-600 transition-all duration-300 ease-in-out" id="toggle3" name="toggle3" type="checkbox"/>
<label class="toggle-label block overflow-hidden h-5 rounded-full bg-slate-300 dark:bg-slate-700 cursor-pointer transition-colors duration-300 ease-in-out" for="toggle3"></label>
</div>
</div>
</div>
</section>
<section class="px-4 mb-8">
<div class="bg-white dark:bg-card-dark rounded-2xl border border-slate-200 dark:border-border-dark shadow-sm overflow-hidden divide-y divide-slate-100 dark:divide-border-dark">
<button class="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-surface-dark transition-colors text-left">
<span class="font-medium text-sm">Payment Methods</span>
<span class="material-symbols-outlined text-slate-400 text-[20px]">chevron_right</span>
</button>
<button class="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-surface-dark transition-colors text-left">
<span class="font-medium text-sm">Help &amp; Support</span>
<span class="material-symbols-outlined text-slate-400 text-[20px]">chevron_right</span>
</button>
<button class="w-full flex items-center justify-between p-4 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors text-left group">
<span class="font-medium text-sm text-red-500 group-hover:text-red-600">Log Out</span>
<span class="material-symbols-outlined text-red-400 text-[20px]">logout</span>
</button>
</div>
<div class="mt-6 text-center">
<p class="text-xs text-slate-400">Version 2.4.0 (Build 1024)</p>
</div>
</section>
</main>
<nav class="fixed bottom-0 w-full max-w-md bg-white/90 dark:bg-background-dark/95 backdrop-blur-lg border-t border-slate-200 dark:border-border-dark pb-safe pt-2 px-2 z-50">
<div class="flex justify-around items-center h-16">
<button class="flex flex-col items-center justify-center w-full h-full gap-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
<span class="material-symbols-outlined text-[24px]">explore</span>
<span class="text-[10px] font-medium">Explore</span>
</button>
<button class="flex flex-col items-center justify-center w-full h-full gap-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
<span class="material-symbols-outlined text-[24px]">dashboard</span>
<span class="text-[10px] font-medium">Dashboard</span>
</button>
<button class="relative flex items-center justify-center w-14 h-14 rounded-full bg-primary text-white -mt-6 shadow-lg shadow-primary/30 border-4 border-white dark:border-background-dark">
<span class="material-symbols-outlined text-[28px]">add</span>
</button>
<button class="flex flex-col items-center justify-center w-full h-full gap-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
<span class="material-symbols-outlined text-[24px]">chat_bubble_outline</span>
<span class="text-[10px] font-medium">Messages</span>
</button>
<button class="flex flex-col items-center justify-center w-full h-full gap-1 text-primary">
<div class="size-6 rounded-full bg-slate-300 dark:bg-slate-700 overflow-hidden ring-2 ring-primary ring-offset-2 ring-offset-white dark:ring-offset-background-dark">
<img class="w-full h-full object-cover" data-alt="User profile picture" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDI5wpt3VVTr0f_ypHKyXPkIdN4VOTxRbl0hFVFVkZT4Hu85bc0UYNeouW30zQA9aZrKmGWssudljjdbMvdwkBBd_5DIIbiThyKvzwv-CqAFl7WuUxH0xzTQ5nisEBk7T59xgcLOar0CssWucPkyYCyIjz0R04j1ZsHqn9TK08wwX7jPJqKPDZ_ivkqfwvyteIZZGnQlAOOFurNI6054Z_M3Kb7zvK6GOCzqCRHcXsn7FyH5va77gSRoPzNJ6-3qc6bzGqFT3oymSQ"/>
</div>
<span class="text-[10px] font-bold">Profile</span>
</button>
</div>
</nav>
</div>
</body></html>
```


---

## SCREEN: active_campaigns___deliverables

Path: `screens/active_campaigns___deliverables/index.html`

```html
<!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>CreatorX - Active Campaigns</title>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#1337ec",
                        "background-light": "#f6f6f8",
                        "background-dark": "#050505", // Deep black for OLED feel
                        "surface-dark": "#121212",
                        "surface-light": "#1c1c1e",
                    },
                    fontFamily: {
                        "display": ["Plus Jakarta Sans", "sans-serif"]
                    },
                    borderRadius: { "DEFAULT": "0.375rem", "lg": "0.5rem", "xl": "0.75rem", "2xl": "1rem", "full": "9999px" },
                },
            },
        }
    </script>
<style>
        /* Custom scrollbar hiding for cleaner mobile look */
        .no-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-background-light dark:bg-background-dark font-display antialiased">
<div class="relative flex h-full min-h-screen w-full flex-col overflow-x-hidden pb-24">
<!-- Top App Bar -->
<header class="sticky top-0 z-20 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md px-4 pt-12 pb-2 border-b border-gray-200 dark:border-white/5">
<div class="flex items-center justify-between">
<h1 class="text-gray-900 dark:text-white text-2xl font-bold leading-tight tracking-tight">My Campaigns</h1>
<button class="group flex h-10 w-10 items-center justify-center rounded-full bg-transparent hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">
<span class="material-symbols-outlined text-gray-900 dark:text-white group-hover:text-primary transition-colors">notifications</span>
<span class="absolute top-13 right-5 h-2 w-2 rounded-full bg-primary border-2 border-background-dark"></span>
</button>
</div>
</header>
<!-- Segmented Control -->
<div class="px-4 py-4">
<div class="flex h-11 w-full items-center rounded-lg bg-gray-200 dark:bg-[#1c1c1e] p-1">
<label class="group flex h-full flex-1 cursor-pointer items-center justify-center rounded-md px-3 text-sm font-semibold transition-all has-[:checked]:bg-white dark:has-[:checked]:bg-[#2c2c2e] has-[:checked]:text-primary has-[:checked]:shadow-sm">
<span class="text-gray-500 dark:text-gray-400 group-has-[:checked]:text-primary">Active</span>
<input checked="" class="hidden" name="status" type="radio" value="active"/>
</label>
<label class="group flex h-full flex-1 cursor-pointer items-center justify-center rounded-md px-3 text-sm font-semibold transition-all has-[:checked]:bg-white dark:has-[:checked]:bg-[#2c2c2e] has-[:checked]:text-primary has-[:checked]:shadow-sm">
<span class="text-gray-500 dark:text-gray-400 group-has-[:checked]:text-primary">Pending</span>
<input class="hidden" name="status" type="radio" value="pending"/>
</label>
<label class="group flex h-full flex-1 cursor-pointer items-center justify-center rounded-md px-3 text-sm font-semibold transition-all has-[:checked]:bg-white dark:has-[:checked]:bg-[#2c2c2e] has-[:checked]:text-primary has-[:checked]:shadow-sm">
<span class="text-gray-500 dark:text-gray-400 group-has-[:checked]:text-primary">History</span>
<input class="hidden" name="status" type="radio" value="history"/>
</label>
</div>
</div>
<!-- Attention Needed Section -->
<div class="flex flex-col gap-3 py-2">
<div class="flex items-center justify-between px-4">
<h2 class="text-gray-900 dark:text-white text-lg font-bold tracking-tight">Attention Needed</h2>
<a class="text-sm font-medium text-primary hover:text-primary/80" href="#">See All</a>
</div>
<!-- Horizontal Scroll Cards -->
<div class="flex gap-4 overflow-x-auto px-4 pb-4 no-scrollbar snap-x snap-mandatory">
<!-- Priority Card 1 -->
<div class="snap-center shrink-0 w-[280px] rounded-xl bg-white dark:bg-[#121212] border border-gray-100 dark:border-white/5 shadow-sm p-3 flex flex-col gap-3 relative overflow-hidden group">
<div class="absolute top-0 left-0 w-1 h-full bg-red-500"></div> <!-- Urgent Indicator -->
<div class="flex items-start justify-between pl-2">
<div class="flex items-center gap-2">
<div class="h-8 w-8 rounded-full bg-cover bg-center border border-white/10" data-alt="Nike logo on a red shoe" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuB5gNEGXCTPRwXusaqzzzQTlVjr57ok8XB0rmMluPTPKfEFxVrWXY1R55916LrVtzsoSDyPWIRMrOxmAxLioEXuNAYQq9B6MTAqSB4cISk2o37r9yWeQiJ37ZBLwgsBTgw9QisFcc6uueJzIdYw4zoGIel0l5cpwhdG49yQeK2_HanDDDznF19crQku0vCsioYuYPDkPWzovt5wBAt3DgWXs3T4Wy9_IKZXT9PW4nnx9niowy6buxOgBu-H8caOYxtQhS4lUAlhNuM');"></div>
<span class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Nike</span>
</div>
<span class="flex items-center gap-1 rounded bg-red-500/10 px-2 py-0.5 text-[10px] font-bold text-red-500 uppercase">
<span class="material-symbols-outlined text-[12px]">schedule</span> 2 Days Left
                        </span>
</div>
<div class="pl-2">
<h3 class="text-base font-bold text-gray-900 dark:text-white leading-tight mb-1">Summer Run: Story Draft</h3>
<p class="text-xs text-gray-500 dark:text-gray-400">Please upload the raw video file for approval before editing.</p>
</div>
<button class="ml-2 mt-1 flex items-center justify-center rounded-lg bg-gray-900 dark:bg-white text-white dark:text-black py-2 text-sm font-bold transition-transform active:scale-95">
                        Upload Content
                    </button>
</div>
<!-- Priority Card 2 -->
<div class="snap-center shrink-0 w-[280px] rounded-xl bg-white dark:bg-[#121212] border border-gray-100 dark:border-white/5 shadow-sm p-3 flex flex-col gap-3 relative overflow-hidden">
<div class="absolute top-0 left-0 w-1 h-full bg-yellow-500"></div> <!-- Warning Indicator -->
<div class="flex items-start justify-between pl-2">
<div class="flex items-center gap-2">
<div class="h-8 w-8 rounded-full bg-cover bg-center border border-white/10" data-alt="Gymshark abstract logo representation" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuDtzNseR7YZZBEQcoetTHOh4VxAf4yhUqoS7SkcoXJL83X0yGTUPdTC_UtF2ec1ejAjEUKy-mFSD0c_-xbDJLHGDHqBMiYyZgquZW6GTm2J8zdd7zBlV6RpSnN2K8ND1ACgtPBgf4ly1CQFUVY2OrF9ON4ZKalOD2-mT2nQpuYXsXJE-9MoAgUREsGMyrmWcDxdvQe1TgFs56lxB7W1hliZ1mIFBygKNCZ8xDUEnE9rgh3OqzG2ehyJyqH5LaaiD2p9pkWr8Qb95RQ');"></div>
<span class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Gymshark</span>
</div>
<span class="flex items-center gap-1 rounded bg-yellow-500/10 px-2 py-0.5 text-[10px] font-bold text-yellow-500 uppercase">
                            Action
                        </span>
</div>
<div class="pl-2">
<h3 class="text-base font-bold text-gray-900 dark:text-white leading-tight mb-1">Contract: Signatures</h3>
<p class="text-xs text-gray-500 dark:text-gray-400">Review and sign the updated terms for the Winter Collection campaign.</p>
</div>
<button class="ml-2 mt-1 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-[#2c2c2e] text-gray-900 dark:text-white py-2 text-sm font-bold transition-transform active:scale-95">
                        Review PDF
                    </button>
</div>
</div>
</div>
<!-- Active Campaigns List -->
<div class="flex flex-col gap-4 px-4 pt-4">
<h2 class="text-gray-900 dark:text-white text-lg font-bold tracking-tight">Active Campaigns</h2>
<!-- Card 1 -->
<div class="flex flex-col rounded-xl bg-white dark:bg-[#121212] border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden">
<!-- Header -->
<div class="flex items-center justify-between p-4 pb-2">
<div class="flex items-center gap-3">
<div class="relative h-12 w-12 rounded-full border border-gray-200 dark:border-white/10 p-0.5">
<div class="h-full w-full rounded-full bg-cover bg-center" data-alt="Sephora logo conceptual makeup" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuCzHIriIrJvKZrgFV7Vqv7nD8PwbEveMAiMyvCsX1kB1aOfXaNNEz9lSBKvh4vpqmQGpMXFvNHe31ha3EmtTm295h7JDdcdSulmqDPrrNbTPIffm7HdCiDcqXq5Z-y-biZkEKFtzVbszwp2zUoQcOX7NBrAvbVIaw5wtTn9sWKlcbD73Q0YCkP4WLhqAqfPT_A_Y2B9INh9Bvl4rFmfOhKgSu_QSjExz_LuwNWNqOG2PUf-mFMndUK1s9Cftv6gpJ9RU4yANH0uTJQ');"></div>
<div class="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-black border border-gray-800">
<span class="text-[10px] text-white material-symbols-outlined">play_arrow</span> <!-- TikTok Icon replacement -->
</div>
</div>
<div class="flex flex-col">
<span class="text-sm font-semibold text-gray-900 dark:text-white">Sephora</span>
<span class="text-xs text-gray-500">TikTok Reel • $1,200</span>
</div>
</div>
<div class="rounded-full bg-blue-500/10 px-2.5 py-1 text-xs font-bold text-blue-500">
                        In Progress
                    </div>
</div>
<!-- Body -->
<div class="px-4 py-2">
<h3 class="text-xl font-bold text-gray-900 dark:text-white">Glow Up Challenge</h3>
<p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Create a 30s transition video using the new foundation line.</p>
</div>
<!-- Thumbnails/Progress -->
<div class="px-4 py-3">
<div class="flex items-center justify-between mb-2">
<span class="text-xs font-medium text-gray-500 dark:text-gray-400">Deliverables</span>
<span class="text-xs font-bold text-primary">1/2 Submitted</span>
</div>
<!-- Progress Bar -->
<div class="h-1.5 w-full rounded-full bg-gray-100 dark:bg-gray-800">
<div class="h-1.5 w-1/2 rounded-full bg-primary"></div>
</div>
<!-- Thumbnails Area -->
<div class="mt-4 flex gap-3">
<div class="relative h-16 w-12 overflow-hidden rounded-md border border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-gray-800 group cursor-pointer">
<div class="h-full w-full bg-cover bg-center opacity-70 group-hover:opacity-100 transition-opacity" data-alt="Makeup tutorial thumbnail" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuCRhME-3P1di4Tcjt1w1yJ-varvCbBZAiAqf10hjqFxOP3ntjKKDlcw44oeBno0H7U937XM4Du9_nC3VrwtgO5N99RCXp-rLzmcHGz30eI4Oz6qQeq7O32565GN2fks1wOm77PVAYZlYwBy11m_d-6o9md4MF453a0WiBvUdZQwud8PJhxcDKOdYDm2usKBXGNvd69Ha1qUfyxseAnEkjDI_TYpBr6zsEIoViIxlMRDBhKQSnc4MkqKReYFlREo4it4GCGu8Qvek0Q');"></div>
<div class="absolute inset-0 flex items-center justify-center">
<span class="material-symbols-outlined text-white text-lg drop-shadow-md">check_circle</span>
</div>
</div>
<button class="flex h-16 w-12 flex-col items-center justify-center rounded-md border border-dashed border-gray-300 dark:border-gray-600 bg-transparent hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
<span class="material-symbols-outlined text-gray-400 text-lg">add</span>
</button>
</div>
</div>
<!-- Footer Action -->
<div class="p-4 pt-2">
<button class="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-transform active:scale-[0.98]">
<span class="material-symbols-outlined text-lg">upload</span>
                        Upload Deliverable
                    </button>
</div>
</div>
<!-- Card 2 -->
<div class="flex flex-col rounded-xl bg-white dark:bg-[#121212] border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden">
<!-- Header -->
<div class="flex items-center justify-between p-4 pb-2">
<div class="flex items-center gap-3">
<div class="relative h-12 w-12 rounded-full border border-gray-200 dark:border-white/10 p-0.5">
<div class="h-full w-full rounded-full bg-cover bg-center" data-alt="Generic tech brand logo gradient" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuCZ9Sk_zVb8NgBVwsEiiV2DHlvPwUUsPvQ-vu1r5XkXqRRxQ_VFZJhOsqDEC4exfTnLxNekgKWemb7NWCXQxGvF8oZmXHzo5nSIxHFYmamcANoqBt24LfsnSmQBQJJoi6VFN8j9VIFeBOhHEbnTxFqcTWzwxB6gif_hRxEQgrxS9tSvbEV3MfazFsEW5ZnuuFzfwZ-BIxRE8XciSsAVAeNxsESQhxK56ErgytCGNw0VSfMlJOYXw66cTbZKkqR1piaO3zfdQL-7OIw');"></div>
<div class="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-tr from-yellow-500 to-pink-500 border border-gray-800">
<span class="text-[10px] text-white material-symbols-outlined">photo_camera</span> <!-- IG Icon replacement -->
</div>
</div>
<div class="flex flex-col">
<span class="text-sm font-semibold text-gray-900 dark:text-white">Spotify</span>
<span class="text-xs text-gray-500">Instagram Story • $800</span>
</div>
</div>
<div class="rounded-full bg-yellow-500/10 px-2.5 py-1 text-xs font-bold text-yellow-500">
                        Reviewing
                    </div>
</div>
<!-- Body -->
<div class="px-4 py-2">
<h3 class="text-xl font-bold text-gray-900 dark:text-white">Wrapped 2024 Launch</h3>
<p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Share your top songs and reaction to your wrapped list.</p>
</div>
<!-- Thumbnails/Progress -->
<div class="px-4 py-3">
<div class="flex items-center justify-between mb-2">
<span class="text-xs font-medium text-gray-500 dark:text-gray-400">Deliverables</span>
<span class="text-xs font-bold text-yellow-500">Under Review</span>
</div>
<!-- Progress Bar -->
<div class="h-1.5 w-full rounded-full bg-gray-100 dark:bg-gray-800">
<div class="h-1.5 w-full rounded-full bg-yellow-500"></div>
</div>
</div>
<!-- Footer Action -->
<div class="p-4 pt-2 flex gap-3">
<button class="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gray-100 dark:bg-[#2c2c2e] py-3 text-sm font-bold text-gray-900 dark:text-white transition-colors">
                        View Details
                    </button>
<button class="flex items-center justify-center gap-2 rounded-lg bg-gray-100 dark:bg-[#2c2c2e] px-4 py-3 text-sm font-bold text-gray-900 dark:text-white transition-colors">
<span class="material-symbols-outlined">chat</span>
</button>
</div>
</div>
</div>
<!-- Bottom Navigation -->
<nav class="fixed bottom-0 left-0 w-full bg-background-light dark:bg-background-dark/95 backdrop-blur-xl border-t border-gray-200 dark:border-white/10 pb-5 pt-2 z-50">
<div class="flex justify-around items-center">
<a class="flex flex-col items-center gap-1 p-2 text-gray-400 hover:text-white transition-colors" href="#">
<span class="material-symbols-outlined text-2xl">grid_view</span>
<span class="text-[10px] font-medium">Home</span>
</a>
<a class="flex flex-col items-center gap-1 p-2 text-primary" href="#">
<span class="material-symbols-outlined text-2xl fill-1">layers</span>
<span class="text-[10px] font-medium">Campaigns</span>
</a>
<!-- Middle FAB (Optional for upload, but kept simple here as requested) -->
<a class="flex flex-col items-center gap-1 p-2 text-gray-400 hover:text-white transition-colors" href="#">
<div class="relative">
<span class="material-symbols-outlined text-2xl">chat_bubble</span>
<span class="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-background-dark"></span>
</div>
<span class="text-[10px] font-medium">Chat</span>
</a>
<a class="flex flex-col items-center gap-1 p-2 text-gray-400 hover:text-white transition-colors" href="#">
<span class="material-symbols-outlined text-2xl">attach_money</span>
<span class="text-[10px] font-medium">Earnings</span>
</a>
</div>
</nav>
</div>
</body></html>
```


---

## SCREEN: apply_to_campaign

Path: `screens/apply_to_campaign/index.html`

```html
<!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Apply to Campaign - CreatorX</title>
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#1337ec",
                        "background-light": "#f6f6f8",
                        "background-dark": "#101322",
                        "surface-dark": "#1c1d27",
                        "border-dark": "#3b3f54",
                        "text-secondary": "#9da1b9",
                    },
                    fontFamily: {
                        "display": ["Plus Jakarta Sans", "sans-serif"]
                    },
                    borderRadius: { "DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "2xl": "1rem", "full": "9999px" },
                },
            },
        }
    </script>
<style>
        /* Custom scrollbar for a cleaner look in webkit browsers */
        ::-webkit-scrollbar {
            width: 6px;
        }
        ::-webkit-scrollbar-track {
            background: transparent;
        }
        ::-webkit-scrollbar-thumb {
            background: #3b3f54;
            border-radius: 3px;
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-white antialiased selection:bg-primary/30">
<div class="relative flex h-full min-h-screen w-full flex-col overflow-x-hidden md:max-w-md md:mx-auto md:border-x md:border-border-dark/50 shadow-2xl">
<!-- Header -->
<header class="sticky top-0 z-50 flex items-center justify-between bg-background-light/95 dark:bg-background-dark/95 p-4 backdrop-blur-md">
<button class="flex size-10 items-center justify-center rounded-full text-slate-900 transition hover:bg-black/5 dark:text-white dark:hover:bg-white/10">
<span class="material-symbols-outlined text-[24px]">arrow_back</span>
</button>
<h1 class="flex-1 text-center text-lg font-bold leading-tight tracking-tight">Apply to Campaign</h1>
<div class="size-10"></div> <!-- Spacer for balance -->
</header>
<!-- Main Content Scroll Area -->
<main class="flex-1 overflow-y-auto px-4 pb-32 pt-2">
<!-- Campaign Summary Card -->
<div class="mb-6 flex overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-surface-dark dark:shadow-[0_0_4px_rgba(0,0,0,0.2)]">
<div class="flex flex-[3_3_0px] flex-col justify-center p-4">
<div class="mb-2 flex items-center gap-2">
<div class="h-6 w-6 overflow-hidden rounded-full bg-white p-0.5">
<img class="h-full w-full object-contain" data-alt="Sephora brand logo icon" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDIaLu4l6mOwCCh6xoNgzy-WA3tlWFt6-pRd58cYE63ReB0KEFzCuffoLBkLGMg_NRxOY2ZoP5FEMaHweKmmm0XCRl5BOKp3X_BbBB5IcM5xOc8lC4-X-_Jq9XHeDZJ0es6iwC9CzJDk0EG9ytIfLoePI8kuhDAa739XdLRHK_iZwW3c5DVVOXnZg5fKvmTroqA9eG0cfOzaSPc__JoqyYXCeiPgZHUluh1T9GocW-5kSyNqIr96lVwfcKKdYt4ncDNbYemlQudP9I"/>
</div>
<span class="text-xs font-semibold uppercase tracking-wider text-text-secondary">Sephora</span>
</div>
<h2 class="mb-1 text-lg font-bold leading-tight text-slate-900 dark:text-white">Summer Glow</h2>
<div class="mt-2 flex flex-wrap gap-2">
<span class="inline-flex items-center rounded-md bg-green-500/10 px-2 py-1 text-xs font-medium text-green-600 dark:bg-green-500/20 dark:text-green-400">
                            $800
                        </span>
<span class="inline-flex items-center rounded-md bg-purple-500/10 px-2 py-1 text-xs font-medium text-purple-600 dark:bg-purple-500/20 dark:text-purple-400">
                            UGC
                        </span>
</div>
</div>
<div class="relative w-28 bg-cover bg-center" data-alt="Cosmetic bottles on a minimal beige background" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuCARMixh25daO2UTWUWH-AXW7A73VY54z8orSavGJMuDN7paZ-yXuUgHBysS5ywnA4HDG3TmMXGb6GlfYvDy53wUnfrB73rGSJzOVKzfI9cxsioqv0aP3LWK0VIE0jlPdn5J47VWnPsdvmb-wVQwssBtp53u9ZASYmV0r9FUIqnm-CNGLDLoE72dAtdUkhFXxJCLyYDxwmZB17x46A9paOJ_yzBf2JpyLBlyQCBFZ-W70e_nX3SOouwApITZUeuf95aycnaSG8uXWA');">
<div class="absolute inset-0 bg-gradient-to-l from-black/20 to-transparent"></div>
</div>
</div>
<!-- Application Form -->
<div class="flex flex-col gap-6">
<!-- Section Header -->
<div>
<h3 class="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Your Pitch</h3>
<p class="mt-1 text-sm text-text-secondary">Why are you the perfect fit for this campaign?</p>
</div>
<!-- Pitch Input -->
<div class="relative">
<textarea class="block w-full resize-none rounded-xl border-0 bg-gray-100 p-4 text-base text-slate-900 placeholder:text-gray-400 focus:ring-2 focus:ring-primary dark:bg-surface-dark dark:text-white dark:placeholder:text-text-secondary dark:focus:ring-primary" placeholder="Hi! I love your products and have an audience that fits perfectly because..." rows="6"></textarea>
</div>
<!-- Grid Inputs -->
<div class="grid grid-cols-2 gap-4">
<label class="flex flex-col gap-2">
<span class="text-sm font-medium text-slate-700 dark:text-gray-300">Proposed Fee</span>
<div class="relative">
<span class="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary">$</span>
<input class="w-full rounded-xl border-0 bg-gray-100 py-3.5 pl-8 pr-4 text-slate-900 focus:ring-2 focus:ring-primary dark:bg-surface-dark dark:text-white dark:focus:ring-primary" placeholder="800" type="number" value="800"/>
</div>
</label>
<label class="flex flex-col gap-2">
<span class="text-sm font-medium text-slate-700 dark:text-gray-300">Portfolio URL</span>
<div class="relative">
<span class="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-text-secondary text-[18px]">link</span>
<input class="w-full rounded-xl border-0 bg-gray-100 py-3.5 pl-10 pr-4 text-slate-900 focus:ring-2 focus:ring-primary dark:bg-surface-dark dark:text-white dark:focus:ring-primary" placeholder="creator.x/you" type="url"/>
</div>
</label>
</div>
<!-- Deliverables Confirmation -->
<div class="rounded-xl border border-gray-200 bg-white p-4 dark:border-border-dark dark:bg-surface-dark">
<h4 class="mb-3 text-sm font-semibold uppercase tracking-wider text-text-secondary">Deliverables Required</h4>
<ul class="space-y-3">
<li class="flex items-center gap-3">
<div class="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
<span class="material-symbols-outlined text-[18px]">videocam</span>
</div>
<span class="text-sm font-medium">1 TikTok / Reel (30-60s)</span>
</li>
<li class="flex items-center gap-3">
<div class="flex size-8 items-center justify-center rounded-full bg-pink-500/10 text-pink-500">
<span class="material-symbols-outlined text-[18px]">history_edu</span>
</div>
<span class="text-sm font-medium">3 Instagram Stories (with link)</span>
</li>
</ul>
</div>
<!-- Auto-attachment Notice -->
<div class="flex items-start gap-3 rounded-lg bg-blue-500/5 p-3 dark:bg-blue-500/10">
<span class="material-symbols-outlined mt-0.5 text-primary">verified_user</span>
<div class="flex flex-col">
<p class="text-sm font-medium text-primary">CreatorX Media Kit attached</p>
<p class="text-xs text-text-secondary">Your profile stats and past work will be shared automatically.</p>
</div>
</div>
</div>
</main>
<!-- Sticky Footer -->
<div class="fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-background-light via-background-light to-transparent pb-6 pt-12 dark:from-background-dark dark:via-background-dark md:absolute">
<div class="mx-auto w-full px-4 md:max-w-md">
<button class="group relative flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-4 font-bold text-white shadow-lg shadow-primary/25 transition-all hover:bg-blue-600 active:scale-[0.98]">
<span>Submit Application</span>
<span class="material-symbols-outlined text-[20px] transition-transform group-hover:translate-x-1">send</span>
</button>
<p class="mt-3 text-center text-xs text-text-secondary">
                    By submitting, you agree to the <a class="underline hover:text-primary" href="#">Creator Terms</a>.
                </p>
</div>
</div>
</div>
</body></html>
```


---

## SCREEN: campaign_details

Path: `screens/campaign_details/index.html`

```html
<!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Campaign Details - CreatorX</title>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;700;800&amp;family=Noto+Sans:wght@400;500;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script id="tailwind-config">
      tailwind.config = {
        darkMode: "class",
        theme: {
          extend: {
            colors: {
              "primary": "#1337ec",
              "background-light": "#f6f6f8",
              "background-dark": "#101322",
              "card-dark": "#1c1f2e", // Slightly lighter than background for cards
            },
            fontFamily: {
              "display": ["Plus Jakarta Sans", "sans-serif"],
              "body": ["Noto Sans", "sans-serif"],
            },
            borderRadius: {"DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "2xl": "1rem", "full": "9999px"},
          },
        },
      }
    </script>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-white overflow-x-hidden w-full min-h-screen flex flex-col">
<!-- Sticky Header -->
<div class="fixed top-0 inset-x-0 z-50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-gray-200 dark:border-white/5 transition-all duration-300">
<div class="flex items-center justify-between p-4 h-16">
<button class="flex items-center justify-center w-10 h-10 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
<span class="material-symbols-outlined text-[24px]">arrow_back</span>
</button>
<h2 class="text-base font-bold opacity-0 transition-opacity duration-300 pointer-events-none absolute left-1/2 -translate-x-1/2">Campaign Details</h2>
<div class="flex items-center gap-2">
<button class="flex items-center justify-center w-10 h-10 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-slate-900 dark:text-white">
<span class="material-symbols-outlined text-[24px]">ios_share</span>
</button>
<button class="flex items-center justify-center w-10 h-10 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-slate-900 dark:text-white">
<span class="material-symbols-outlined text-[24px]">bookmark_border</span>
</button>
</div>
</div>
</div>
<!-- Scrollable Content -->
<div class="flex-1 pb-28 pt-16">
<!-- Hero Section -->
<div class="p-4">
<div class="relative w-full h-72 rounded-2xl overflow-hidden shadow-2xl bg-gray-800">
<div class="absolute inset-0 bg-cover bg-center transition-transform hover:scale-105 duration-700" data-alt="Bright summer skincare products on a beach setting with sunlight" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuB7kHGRMpaP_DP9tKdEzqWMcLrNSCxvB2W3TtUBPDzy3CsIHH8fiSDkE9Vu3EEHc68UZNhHbuSCN5Y-pP284MxRqgrBnfUMx1aSQniVByh1Da6G2JXHyYmq5NlYpIuJg4YvT2b06IRgbp9ExWY6g_mrVQbH995sTxpWBEzNJI1JupvHgP2JrImPGDcY2VJeJEgxp7pp9PS9EYMRLDshm8ZuG_5Dls1K0spS5hG3ayaSAKPfbfE_SjvAHMfU4k3CwujORWeBHNKEbEM');">
</div>
<!-- Gradient Overlay -->
<div class="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/50 to-transparent opacity-90"></div>
<div class="absolute bottom-0 left-0 right-0 p-5 flex flex-col gap-4">
<!-- Brand Pill -->
<div class="flex items-center gap-3 bg-white/10 backdrop-blur-md p-2 pr-4 rounded-full w-fit border border-white/10">
<div class="w-8 h-8 rounded-full overflow-hidden bg-white">
<img class="w-full h-full object-cover" data-alt="GlowCo Brand Logo abstract minimalist" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCuHVQBE9-uplPiittvG5rorLxWhTCePw98s7rpMxifQN0NwrBTXr_Vj9v56XPjVdi6ZbVRg9lqrrf2kuYSOdVmFRefM2SJNYJAMzJ4NOVROI4DJ_AjgipxxF6KAEJ9MDUtIYjQYqXpyXH5XGMqplgPVYCTiVuYR69fEuZCcV7JEcppf0rCQPVAkyaY0omLFMtWemgmFZ7WP3BRBo-3OQZN4QTTn1XtoX74YjcVnoeRRtTsf5Wa_CRa2FO-jCP2QtDKBmHdGn-_9ws"/>
</div>
<div class="flex flex-col justify-center">
<span class="text-xs font-bold text-white leading-none mb-0.5">GlowCo</span>
<span class="text-[10px] text-gray-300 leading-none flex items-center gap-0.5">
                                Verified Brand <span class="material-symbols-outlined text-[10px] text-blue-400">verified</span>
</span>
</div>
</div>
<!-- Title -->
<h1 class="text-3xl font-extrabold text-white leading-tight tracking-tight">Summer Skincare Launch</h1>
</div>
</div>
</div>
<!-- Tags / Chips -->
<div class="px-4 pb-2 overflow-x-auto no-scrollbar">
<div class="flex gap-2">
<div class="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-white dark:bg-[#282b39] border border-gray-200 dark:border-transparent px-3">
<span class="text-slate-700 dark:text-white text-xs font-bold uppercase tracking-wider">#Skincare</span>
</div>
<div class="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-white dark:bg-[#282b39] border border-gray-200 dark:border-transparent px-3">
<span class="text-slate-700 dark:text-white text-xs font-bold uppercase tracking-wider">#Lifestyle</span>
</div>
<div class="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-primary/10 border border-primary/20 px-3">
<span class="text-primary text-xs font-bold uppercase tracking-wider">Paid Partnership</span>
</div>
</div>
</div>
<!-- At a Glance Stats -->
<div class="p-4">
<div class="grid grid-cols-3 gap-3">
<div class="flex flex-col items-center justify-center p-3 rounded-xl bg-white dark:bg-card-dark border border-gray-100 dark:border-white/5 shadow-sm">
<span class="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Earn</span>
<span class="text-lg font-bold text-slate-900 dark:text-white">$1,200</span>
<span class="text-[10px] text-gray-400">+5% comms</span>
</div>
<div class="flex flex-col items-center justify-center p-3 rounded-xl bg-white dark:bg-card-dark border border-gray-100 dark:border-white/5 shadow-sm">
<span class="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Platform</span>
<div class="flex items-center gap-1">
<span class="material-symbols-outlined text-pink-500 text-[18px]">photo_camera</span>
<span class="text-sm font-bold text-slate-900 dark:text-white">IG Reel</span>
</div>
</div>
<div class="flex flex-col items-center justify-center p-3 rounded-xl bg-white dark:bg-card-dark border border-gray-100 dark:border-white/5 shadow-sm">
<span class="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Deadline</span>
<span class="text-lg font-bold text-slate-900 dark:text-white">Oct 15</span>
<span class="text-[10px] text-gray-400">2023</span>
</div>
</div>
</div>
<div class="h-px bg-gray-200 dark:bg-white/5 mx-4 my-2"></div>
<!-- Sections -->
<div class="flex flex-col gap-6 p-4">
<!-- About Section -->
<div class="space-y-3">
<h3 class="text-lg font-bold text-slate-900 dark:text-white">About the Campaign</h3>
<p class="text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                    We are looking for authentic creators to showcase our new SPF 50 line. The goal is to highlight the lightweight texture and non-greasy finish. We want to see how you incorporate sun protection into your daily summer routine, keeping it fun and educational.
                </p>
</div>
<!-- Deliverables Section -->
<div class="space-y-4">
<div class="flex items-center justify-between">
<h3 class="text-lg font-bold text-slate-900 dark:text-white">Your Assignment</h3>
<span class="text-xs font-semibold bg-primary/20 text-primary px-2 py-1 rounded">2 Items</span>
</div>
<div class="flex flex-col gap-3">
<!-- Item 1 -->
<div class="flex gap-4 p-4 rounded-xl bg-white dark:bg-card-dark border border-gray-100 dark:border-white/5">
<div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
<span class="material-symbols-outlined text-primary">movie</span>
</div>
<div class="flex flex-col">
<span class="font-bold text-slate-900 dark:text-white">1x Instagram Reel</span>
<span class="text-sm text-gray-500 dark:text-gray-400 mt-1">30-60s vertical video focusing on application texture.</span>
</div>
</div>
<!-- Item 2 -->
<div class="flex gap-4 p-4 rounded-xl bg-white dark:bg-card-dark border border-gray-100 dark:border-white/5">
<div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
<span class="material-symbols-outlined text-primary">link</span>
</div>
<div class="flex flex-col">
<span class="font-bold text-slate-900 dark:text-white">Link in Bio</span>
<span class="text-sm text-gray-500 dark:text-gray-400 mt-1">Maintain tracking link in bio for 48 hours.</span>
</div>
</div>
</div>
</div>
<!-- Do's and Don'ts -->
<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
<div class="p-4 rounded-xl bg-green-500/5 border border-green-500/10">
<div class="flex items-center gap-2 mb-3">
<span class="material-symbols-outlined text-green-500">check_circle</span>
<span class="font-bold text-green-600 dark:text-green-400">Do's</span>
</div>
<ul class="space-y-2">
<li class="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
<span class="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0"></span>
                            Show product packaging clearly
                        </li>
<li class="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
<span class="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0"></span>
                            Mention "No White Cast"
                        </li>
</ul>
</div>
<div class="p-4 rounded-xl bg-red-500/5 border border-red-500/10">
<div class="flex items-center gap-2 mb-3">
<span class="material-symbols-outlined text-red-500">cancel</span>
<span class="font-bold text-red-600 dark:text-red-400">Don'ts</span>
</div>
<ul class="space-y-2">
<li class="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
<span class="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0"></span>
                            Mention other SPF brands
                        </li>
<li class="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
<span class="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0"></span>
                            Use music with copyright
                        </li>
</ul>
</div>
</div>
</div>
</div>
<!-- Sticky Bottom CTA -->
<div class="fixed bottom-0 inset-x-0 p-4 pb-8 bg-background-light dark:bg-background-dark border-t border-gray-200 dark:border-white/5 z-40">
<button class="w-full h-14 bg-primary hover:bg-primary/90 active:scale-[0.98] transition-all rounded-xl flex items-center justify-between px-6 shadow-lg shadow-blue-900/20 group">
<div class="flex flex-col items-start">
<span class="text-white font-bold text-base leading-none">Apply Now</span>
<span class="text-blue-200 text-xs mt-1">24 hours left</span>
</div>
<div class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
<span class="material-symbols-outlined text-white text-sm">arrow_forward</span>
</div>
</button>
</div>
</body></html>
```


---

## SCREEN: campaign_discovery__list

Path: `screens/campaign_discovery__list/index.html`

```html
<!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>CreatorX - Campaign Discovery</title>
<!-- Google Fonts -->
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&amp;family=Noto+Sans:wght@400;500;600;700&amp;display=swap" rel="stylesheet"/>
<!-- Material Symbols -->
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<!-- Tailwind CSS -->
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<!-- Theme Configuration -->
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#1337ec",
                        "background-light": "#f6f6f8",
                        "background-dark": "#050505", // Deep charcoal/black per prompt
                        "surface-dark": "#121212", // Slightly lighter for cards
                        "surface-highlight": "#1A1A1A",
                    },
                    fontFamily: {
                        "display": ["Plus Jakarta Sans", "sans-serif"],
                        "body": ["Noto Sans", "sans-serif"],
                    },
                    borderRadius: {"DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "2xl": "1rem", "full": "9999px"},
                },
            },
        }
    </script>
<style>
        /* Custom scrollbar hiding for cleaner mobile look */
        .no-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-background-light dark:bg-background-dark font-display antialiased text-slate-900 dark:text-white pb-24">
<!-- Top Sticky Header -->
<header class="sticky top-0 z-50 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-md border-b border-gray-200 dark:border-white/5 px-4 pt-12 pb-3 flex items-center justify-between">
<div class="flex items-center gap-3">
<div class="relative">
<div class="bg-center bg-no-repeat bg-cover rounded-full size-10 border-2 border-white/10" data-alt="Creator profile picture showing a smiling young woman" style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuDGGeer-sGgLMdS6mVtiH6EX-bhno2PZYo2R1XReHPCf5UjZ56KnUhP_ae2W-1Wf-dskW45mPzJgTP5yiKjYlHhgsvQMSksp9fylG_kJJTUFaImmc0qM3sXhyPZpkT4-AhPNMqONK6Iiw58UWqT_LlTsJrosUUBC3WkcgmOTod6fst3PwPhj4jHCJlA-6da7-xTHOAwpt6bGFxrUupMezeyxQalCmbrfFaaTxL-Z_2n8FITJW5zlIsD-pUAMT3KV6LzuuO59hVPUD8");'>
</div>
<div class="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full border-2 border-background-dark"></div>
</div>
<div>
<h1 class="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">Discover</h1>
</div>
</div>
<button class="flex items-center justify-center size-10 rounded-full bg-white/5 hover:bg-white/10 transition-colors relative">
<span class="material-symbols-outlined text-slate-900 dark:text-white" style="font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;">notifications</span>
<span class="absolute top-2 right-2.5 size-2 bg-primary rounded-full"></span>
</button>
</header>
<!-- Search & Filter Section -->
<div class="px-4 py-4 space-y-4">
<!-- Search Bar -->
<div class="relative group">
<div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
<span class="material-symbols-outlined text-gray-500 group-focus-within:text-primary transition-colors">search</span>
</div>
<input class="block w-full p-3 pl-10 text-sm rounded-xl bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/5 placeholder-gray-500 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm" placeholder="Search campaigns, brands..." type="text"/>
<div class="absolute inset-y-0 right-0 flex items-center pr-2">
<button class="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
<span class="material-symbols-outlined text-[20px]">tune</span>
</button>
</div>
</div>
<!-- Filter Chips -->
<div class="flex gap-2 overflow-x-auto no-scrollbar pb-1">
<button class="flex h-9 shrink-0 items-center justify-center px-4 rounded-full bg-primary text-white text-sm font-semibold shadow-lg shadow-primary/20 transition-transform active:scale-95">
                All
            </button>
<button class="flex h-9 shrink-0 items-center justify-center px-4 rounded-full bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/10 text-slate-600 dark:text-gray-300 text-sm font-medium whitespace-nowrap hover:bg-gray-50 dark:hover:bg-surface-highlight transition-colors">
                Beauty
            </button>
<button class="flex h-9 shrink-0 items-center justify-center px-4 rounded-full bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/10 text-slate-600 dark:text-gray-300 text-sm font-medium whitespace-nowrap hover:bg-gray-50 dark:hover:bg-surface-highlight transition-colors">
                Tech
            </button>
<button class="flex h-9 shrink-0 items-center justify-center px-4 rounded-full bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/10 text-slate-600 dark:text-gray-300 text-sm font-medium whitespace-nowrap hover:bg-gray-50 dark:hover:bg-surface-highlight transition-colors">
                Fashion
            </button>
<button class="flex h-9 shrink-0 items-center justify-center px-4 rounded-full bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/10 text-slate-600 dark:text-gray-300 text-sm font-medium whitespace-nowrap hover:bg-gray-50 dark:hover:bg-surface-highlight transition-colors">
                Gifting Only
            </button>
</div>
</div>
<!-- Featured Section -->
<div class="pt-2 pb-6">
<div class="flex items-center justify-between px-4 mb-3">
<h3 class="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Featured Opportunities</h3>
<button class="text-primary text-sm font-semibold">See All</button>
</div>
<div class="flex overflow-x-auto gap-4 px-4 no-scrollbar snap-x snap-mandatory">
<!-- Featured Card 1 -->
<div class="snap-center shrink-0 w-72 h-48 rounded-2xl relative overflow-hidden group">
<div class="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105" data-alt="Abstract vibrant gradient background representing high energy tech" style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuAnA9wvHVp5q0DHmdUZzUgdMEkNo07dEmpe43XaSuZ12fDbox6_qbFQFUHMlAKZdNJh_baRZiwcaeccbjj0-7N1L6X20kap8G5z4OqfhvC68YbfrafYRbDnh9xPGGDcwJ7v_99twUcnnxp2xh6AExPM7GsIayaXUvPCwGdemdI-vnrzGhJKLz_I-ZV_WpKUQjrl0oQ1RDHrPHKImHnvhiZEj6xsImVDNUVrXTgFu_j3Hfhct66trVVfNHns3lcrD__FBBuYuoNauRk");'>
<div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
</div>
<div class="absolute bottom-0 left-0 w-full p-4 flex flex-col justify-end h-full">
<div class="flex items-center gap-2 mb-1">
<span class="bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase tracking-wider border border-white/10">High Ticket</span>
</div>
<h4 class="text-white font-bold text-lg leading-tight mb-1">Samsung Galaxy Ultra Review Series</h4>
<p class="text-primary font-bold text-base">$2,500 <span class="text-gray-300 text-sm font-normal">• 3 Videos</span></p>
</div>
</div>
<!-- Featured Card 2 -->
<div class="snap-center shrink-0 w-72 h-48 rounded-2xl relative overflow-hidden group">
<div class="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105" data-alt="Fashion model walking in summer collection clothes" style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuDC0cp3VcGXW5np1eydiDuT7d0H5Z8XZbcPdigBJj9fgvs3xPJcYfReS8CQmgGFERPOWwOetyvYoqLD7boB27SxPI_yG7QqNnBY9xk2a-nQiclXfD4hnPKRDL_Xg4dUzDHlGfwvbD2lXoAAqkyzQ5D3OhrutWvg0I0-PNk-3dgHXxfDEDtMQHaSk72qgDaU7J3SKrqgY5jFL3tdqfU7R7hOh7fPeVjl1F27IJheNjUtCrFVXkaYK4LbF9MDuyF-gJ-2qK__EPgUU2I");'>
<div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
</div>
<div class="absolute bottom-0 left-0 w-full p-4 flex flex-col justify-end h-full">
<div class="flex items-center gap-2 mb-1">
<span class="bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase tracking-wider border border-white/10">Trending</span>
</div>
<h4 class="text-white font-bold text-lg leading-tight mb-1">Zara Summer Collection Haul</h4>
<p class="text-primary font-bold text-base">$1,200 <span class="text-gray-300 text-sm font-normal">• 1 Reel + 2 Stories</span></p>
</div>
</div>
</div>
</div>
<!-- Campaign List -->
<div class="px-4 space-y-4">
<h3 class="text-lg font-bold text-slate-900 dark:text-white tracking-tight mb-2">For You</h3>
<!-- Card 1: Nike -->
<article class="bg-white dark:bg-surface-dark rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-white/5 active:scale-[0.98] transition-transform">
<div class="flex items-start justify-between mb-3">
<div class="flex items-center gap-3">
<div class="bg-white p-1 rounded-full size-12 shadow-sm shrink-0">
<div class="w-full h-full rounded-full bg-contain bg-center bg-no-repeat" data-alt="Nike logo" style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuBXjC6OBjtr42tPmUw5pCVxLcCQT_Phmq5ctafZkx8H3Dzk0USkdnfYtsyGAcliAjHtLDSMkafBeu-WOAeNHsJgCrVnoNXVqJVYjyWKmxv0_i0j5acsZP5ewzfVXalu9a2jMaM9NmsxRmdY82_QJZVtKFp3sYVrugEBj4bmemmjzUUd9-Rpdh-2rWZ2cR_qpAeYJnVtqjd6HGI6GTkPeRvYk_mzkYk_imnaKfbtA_9xgtTAb8lMFrusEOSppU1DIRhcMPxkOvmI09A");'></div>
</div>
<div>
<h4 class="text-slate-900 dark:text-white font-bold text-base">Nike</h4>
<p class="text-gray-500 text-xs">Posted 2h ago</p>
</div>
</div>
<div class="text-right">
<p class="text-primary font-extrabold text-lg">$1,500</p>
</div>
</div>
<div class="w-full h-40 rounded-xl bg-cover bg-center mb-4 relative overflow-hidden" data-alt="Close up of modern running shoes on a track" style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuBofE3KZB4nfB4uCFDnz20vIcXtub1I2jW_1X8HZz3XFrfuBxlisluVcMry4tLy4RzlrAblvm4I6EuMA8E684J6Q5NjmynJujAVmjSexk4wfyQdIZm3lerfpnObE8R3TEvluh_DMi3S2lOUjuZmt1qcYrY6gnTADwPTnPvwCdl4v_tnjTNkKMJfNXkYPxz_a2B5lkM2SvpYeEqJFs72W9qjh3RF7SBuWMQf2YNKAoBzu3JPBYebpdxEbnGPr7L_Nup8h6mNo1OgiVw");'>
<div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
<div class="absolute bottom-2 left-2 flex gap-1">
<div class="backdrop-blur-md bg-black/40 rounded px-2 py-1 flex items-center gap-1 border border-white/10">
<span class="text-xs text-white font-medium">Reels</span>
</div>
<div class="backdrop-blur-md bg-black/40 rounded px-2 py-1 flex items-center gap-1 border border-white/10">
<span class="text-xs text-white font-medium">TikTok</span>
</div>
</div>
</div>
<div class="flex items-end justify-between">
<div>
<h3 class="text-slate-900 dark:text-white font-bold text-lg leading-tight">Air Max Day 2024 Promo</h3>
<p class="text-gray-500 text-sm mt-1 line-clamp-1">Create high-energy content featuring the new Air Max Pulse.</p>
</div>
<button class="bg-primary hover:bg-blue-700 text-white p-2 rounded-lg transition-colors ml-4 shrink-0">
<span class="material-symbols-outlined text-[20px]">arrow_forward</span>
</button>
</div>
</article>
<!-- Card 2: Sephora -->
<article class="bg-white dark:bg-surface-dark rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-white/5 active:scale-[0.98] transition-transform">
<div class="flex items-start justify-between mb-3">
<div class="flex items-center gap-3">
<div class="bg-black p-0.5 rounded-full size-12 shadow-sm shrink-0 overflow-hidden">
<div class="w-full h-full rounded-full bg-contain bg-center bg-no-repeat bg-white" data-alt="Sephora logo" style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuBgzPHX4YXhBEqG1NzaOkZSE1UROw7hgkjQO0CO9cF_ejed9XBZFyHdKYH_dnaRbicwk0WAPRxMVIcubpRLE1SC6A59HvHnip3cneTYWQU3CMPdV0d5jWpWiyg7l4H17OOjfo__m2vqelTU0GFjVwQHRPsbKy4-kdKdfZ02eXMOPuNSIjrLBhprehKomne_jF00uB6u5AFYRd5YPQOvCFkr-H72lxyyZ0CGLl2ddp7Hl_CkyQBaryLZO3VwC_GNzkuX8JV9zL8UKaM"); background-size: 80%;'></div>
</div>
<div>
<h4 class="text-slate-900 dark:text-white font-bold text-base">Sephora</h4>
<p class="text-gray-500 text-xs">Posted 5h ago</p>
</div>
</div>
<div class="text-right">
<p class="text-primary font-extrabold text-lg">$800 <span class="text-xs font-normal text-slate-900 dark:text-white">+ Product</span></p>
</div>
</div>
<div class="w-full h-40 rounded-xl bg-cover bg-center mb-4 relative overflow-hidden" data-alt="Assortment of makeup brushes and powder on a table" style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuD51r9XOXvoy6ruRHb7yJmhOUdDyC_qWlEiGnuxdmxQRLkInHLXqbcUuCe7RiNtpK21SKmZF3gg8VBxd_7zH_AW7U7muxIiGtUfzELcsQ_x8fxSgvhGFowwllutoIkbRwdKFBcY2H7FcKUy_HyTSMjEYQ6OvgpeIxGWNfQFd3QNUbqiMn1vzvtgwptU-szJSNEd1ooFcIDIATZ9gc2hE2Ez1E0RuDe92hNItPY2_Hfw6lI86D74NVcwOZzwS9r0OXeiy59XdZvpQZw");'>
<div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
<div class="absolute bottom-2 left-2 flex gap-1">
<div class="backdrop-blur-md bg-black/40 rounded px-2 py-1 flex items-center gap-1 border border-white/10">
<span class="text-xs text-white font-medium">Shorts</span>
</div>
</div>
</div>
<div class="flex items-end justify-between">
<div>
<h3 class="text-slate-900 dark:text-white font-bold text-lg leading-tight">Clean Beauty Review</h3>
<p class="text-gray-500 text-sm mt-1 line-clamp-1">Honest review of our new organic skincare line.</p>
</div>
<button class="bg-primary/10 hover:bg-primary/20 text-primary p-2 rounded-lg transition-colors ml-4 shrink-0">
<span class="material-symbols-outlined text-[20px]">arrow_forward</span>
</button>
</div>
</article>
<!-- Card 3: Casetify -->
<article class="bg-white dark:bg-surface-dark rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-white/5 active:scale-[0.98] transition-transform">
<div class="flex items-start justify-between mb-3">
<div class="flex items-center gap-3">
<div class="bg-white p-0.5 rounded-full size-12 shadow-sm shrink-0 overflow-hidden">
<div class="w-full h-full rounded-full bg-cover bg-center bg-no-repeat" data-alt="Casetify logo" style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuBlhxQPijLnvvjAzJtJZ8V2bWuX4SP96ju1b_TrNeYfmStJp1aFVVslcFyhdVhGOc3WSwN2t_aUFuGq4WuYyBWBHSncfe7gBfUSn2bnR5XWlloWjecxhwDROieG5kgTNeP6kdGRN09tzmXCWPWn4WpEJbHbKMJJ1FfI0qLWsvmpkMJ5jeLbLzdV3_OKTsJa_N2E0n8MVQPJ_XAoitrXN7GAB5_3VwfTg6CwHu4vOkuG2SWTm6b5GOKcje56wYlvAFdWFLtZKMCXL_I");'></div>
</div>
<div>
<h4 class="text-slate-900 dark:text-white font-bold text-base">Casetify</h4>
<p class="text-gray-500 text-xs">Posted 1d ago</p>
</div>
</div>
<div class="text-right">
<p class="text-primary font-extrabold text-lg">$350</p>
</div>
</div>
<!-- No Hero Image for smaller campaign variant -->
<div class="bg-gray-50 dark:bg-white/5 rounded-xl p-3 mb-4">
<div class="flex gap-2">
<div class="bg-gray-200 dark:bg-white/10 rounded px-2 py-1 flex items-center gap-1">
<span class="text-xs text-slate-700 dark:text-gray-300 font-medium">IG Story</span>
</div>
</div>
</div>
<div class="flex items-end justify-between">
<div>
<h3 class="text-slate-900 dark:text-white font-bold text-lg leading-tight">Back to School Drop</h3>
<p class="text-gray-500 text-sm mt-1 line-clamp-1">Showcase 3 different cases with your school outfit.</p>
</div>
<button class="bg-primary/10 hover:bg-primary/20 text-primary p-2 rounded-lg transition-colors ml-4 shrink-0">
<span class="material-symbols-outlined text-[20px]">arrow_forward</span>
</button>
</div>
</article>
</div>
<!-- Bottom Navigation -->
<nav class="fixed bottom-0 w-full z-50 bg-background-light/90 dark:bg-background-dark/95 backdrop-blur-xl border-t border-gray-200 dark:border-white/5 pb-safe pt-2">
<div class="grid grid-cols-4 h-16 items-center">
<a class="flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-primary transition-colors" href="#">
<span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 0;">home</span>
<span class="text-[10px] font-medium">Home</span>
</a>
<a class="flex flex-col items-center justify-center gap-1 text-primary" href="#">
<span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">explore</span>
<span class="text-[10px] font-medium">Discover</span>
</a>
<a class="flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-primary transition-colors" href="#">
<div class="relative">
<span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 0;">chat_bubble</span>
<span class="absolute -top-0.5 -right-0.5 size-2 bg-red-500 rounded-full"></span>
</div>
<span class="text-[10px] font-medium">Messages</span>
</a>
<a class="flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-primary transition-colors" href="#">
<span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 0;">account_balance_wallet</span>
<span class="text-[10px] font-medium">Wallet</span>
</a>
</div>
<!-- Safe area spacing for iOS home indicator -->
<div class="h-5"></div>
</nav>
</body></html>
```


---

## SCREEN: chat_thread

Path: `screens/chat_thread/index.html`

```html
<!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Chat Thread - CreatorX</title>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#1337ec",
                        "background-light": "#f6f6f8",
                        "background-dark": "#050505", /* Overriding to darker black for premium feel as requested */
                        "surface-dark": "#121212",
                        "bubble-received": "#1E1E1E",
                    },
                    fontFamily: {
                        "display": ["Plus Jakarta Sans", "sans-serif"]
                    },
                    borderRadius: {"DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "2xl": "1rem", "full": "9999px"},
                },
            },
        }
    </script>
<style>
        /* Custom scrollbar for webkit */
        ::-webkit-scrollbar {
            width: 6px;
        }
        ::-webkit-scrollbar-track {
            background: transparent;
        }
        ::-webkit-scrollbar-thumb {
            background: #333;
            border-radius: 3px;
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display antialiased selection:bg-primary/30">
<div class="relative flex h-full min-h-screen w-full flex-col overflow-hidden max-w-md mx-auto shadow-2xl border-x border-white/5">
<!-- Header -->
<header class="sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-gray-200 dark:border-white/5">
<button class="flex items-center justify-center w-10 h-10 -ml-2 text-gray-500 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors">
<span class="material-symbols-outlined" style="font-size: 24px;">arrow_back_ios_new</span>
</button>
<div class="flex flex-1 items-center gap-3 ml-1">
<div class="relative">
<div class="w-10 h-10 rounded-full bg-cover bg-center border border-gray-200 dark:border-white/10" data-alt="Nike red shoe product shot as brand avatar" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuDS4bMfzaiQnTA13x_KNa4OaV5E_XdHJX6yHh7O6AEaMWtYpBnWCvves3kTCxyc_COm94TButInH0QXLlwjgoR6UjY77GldxlBzBrICw1AWnlP_2mSXx837hqPo3sWd5zjAiunjeTViY5LzX-lAYmRGhzgcHy2UIPwKlztYaU6RygPFmBaIIy1n_Crj6axei9U-riaKh7aYycnoRW92M4p_diB9GxYqEFVr051IBdTNL_UmC5_e31LMQ3E8NKoXP5nsGWF5lmYRjP8');">
</div>
<div class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-background-dark"></div>
</div>
<div class="flex flex-col">
<h1 class="text-sm font-bold text-gray-900 dark:text-white leading-tight">Nike Sportswear</h1>
<span class="text-xs text-primary font-medium">Active now</span>
</div>
</div>
<button class="flex items-center justify-center w-10 h-10 text-gray-400 dark:text-gray-400 hover:text-primary dark:hover:text-primary hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors">
<span class="material-symbols-outlined">info</span>
</button>
</header>
<!-- Chat Content -->
<main class="flex-1 overflow-y-auto p-4 pb-24 flex flex-col gap-4">
<!-- Timestamp -->
<div class="flex justify-center py-2">
<span class="text-[11px] font-medium text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-white/5 px-3 py-1 rounded-full">Today</span>
</div>
<!-- System Message -->
<div class="flex justify-center mb-2">
<p class="text-xs text-gray-500 dark:text-gray-400 text-center max-w-[80%]">
                    Campaign <span class="text-gray-800 dark:text-white font-semibold">"Summer Run"</span> accepted. Chat started.
                </p>
</div>
<!-- Received Message (Brand) -->
<div class="flex items-end gap-3 group">
<div class="w-8 h-8 rounded-full bg-cover bg-center shrink-0 mb-1" data-alt="Nike brand avatar small" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuDdIgihPuS8NI744K9oxfHnM3w1bMApyB7clVO3z8FTl3EkoUYLxnY8oRRgCWF9mesg2rCh5Onidb0QcvLUHkX1WIy4vnTvOdWhO1tGzn_tYpWTZm82cIgfzG0wZfD08N7R5X5_RX-ty7zt5OU8rIt-UNKbjhXrxjQcyaWM4U0JYarVlSvXnILKZsE8F0175LnrSGr8e-B1YLAOW3F5bFc9C3K0SGpN-xK6QJiko21KY3_ddUFlIggeZL7gP_ZREZj_5ZJ8K6HS61w');">
</div>
<div class="flex flex-col gap-1 max-w-[75%]">
<div class="bg-gray-200 dark:bg-bubble-received p-3.5 rounded-2xl rounded-bl-sm shadow-sm">
<p class="text-[15px] leading-relaxed text-gray-800 dark:text-gray-200">
                            Hey Alex! Excited to work with you on the Summer Run campaign. 🏃‍♂️ Can you share the draft by Friday?
                        </p>
</div>
<span class="text-[10px] text-gray-400 dark:text-gray-600 ml-1">10:23 AM</span>
</div>
</div>
<!-- Sent Message (Creator) -->
<div class="flex items-end justify-end gap-3 group">
<div class="flex flex-col gap-1 items-end max-w-[75%]">
<div class="bg-primary p-3.5 rounded-2xl rounded-br-sm shadow-md shadow-primary/10">
<p class="text-[15px] leading-relaxed text-white">
                            Hi! Absolutely. I'll have the video draft uploaded here by Thursday evening.
                        </p>
</div>
<div class="flex items-center gap-1 mr-1">
<span class="text-[10px] text-gray-400 dark:text-gray-500">10:25 AM</span>
<span class="material-symbols-outlined text-primary text-[14px]">done_all</span>
</div>
</div>
</div>
<!-- Received Message (Brand) -->
<div class="flex items-end gap-3 group">
<div class="w-8 h-8 rounded-full bg-cover bg-center shrink-0 mb-1" data-alt="Nike brand avatar small" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuCg6CFlfwxUQumfQJYwLuDQApP3mKN458Rrc3bGBlkCy7LlyjsJDwV1QMXn8JalC_pCUL9mGv3pedqBX_-JKEs4CVUUuIzTKD3WE6C-LQmOL_w85i8NU3Op4FAE8RJExiBgv48zMPOtGzG4J-6qxLonAt8cj3wfBzAKf9Fe2kUedJR0usHJ26iDw6rMXDkAVBJ9Om04a-i53l_Z-OVhujdXDmQNRn2dRa_w3Rx5I4yq4A5sarztF4H4qb2RLXtx-JERzAP_Nxa9sbg');">
</div>
<div class="flex flex-col gap-1 max-w-[75%]">
<div class="bg-gray-200 dark:bg-bubble-received p-3.5 rounded-2xl rounded-bl-sm shadow-sm">
<p class="text-[15px] leading-relaxed text-gray-800 dark:text-gray-200">
                            Perfect, looking forward to it. Let us know if you need any assets from our side.
                        </p>
</div>
<span class="text-[10px] text-gray-400 dark:text-gray-600 ml-1">10:45 AM</span>
</div>
</div>
<!-- Sent Message (Creator) - Attachment Placeholder -->
<div class="flex items-end justify-end gap-3 group">
<div class="flex flex-col gap-1 items-end max-w-[75%]">
<div class="bg-primary/10 border border-primary/20 p-3 rounded-2xl rounded-br-sm flex items-center gap-3">
<div class="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0 text-primary">
<span class="material-symbols-outlined">movie</span>
</div>
<div class="flex flex-col pr-2">
<span class="text-sm font-medium text-white">Draft_v1.mp4</span>
<span class="text-[10px] text-white/60">14.2 MB • Uploading...</span>
</div>
<div class="h-8 w-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin"></div>
</div>
<div class="flex items-center gap-1 mr-1">
<span class="text-[10px] text-gray-400 dark:text-gray-500">Just now</span>
</div>
</div>
</div>
</main>
<!-- Input Area -->
<footer class="absolute bottom-0 w-full bg-white dark:bg-background-dark border-t border-gray-200 dark:border-white/5 px-4 py-3 pb-6">
<div class="flex items-end gap-2">
<button class="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors shrink-0">
<span class="material-symbols-outlined">add</span>
</button>
<div class="flex-1 bg-gray-100 dark:bg-[#1A1A1A] rounded-2xl flex items-center min-h-[44px] px-4 py-2 border border-transparent focus-within:border-primary/50 transition-colors">
<input class="bg-transparent border-none focus:ring-0 w-full text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 text-[15px] p-0" placeholder="Type a message..." type="text"/>
<button class="ml-2 text-gray-400 hover:text-primary transition-colors">
<span class="material-symbols-outlined text-[20px]">sentiment_satisfied</span>
</button>
</div>
<button class="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all shrink-0">
<span class="material-symbols-outlined" style="font-size: 20px; margin-left: 2px;">send</span>
</button>
</div>
</footer>
</div>
</body></html>
```


---

## SCREEN: connect_social_accounts

Path: `screens/connect_social_accounts/index.html`

```html
<!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Connect Social Accounts - CreatorX</title>
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&amp;family=Noto+Sans:wght@400;500;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#1337ec",
                        "background-light": "#f6f6f8",
                        "background-dark": "#101322",
                    },
                    fontFamily: {
                        "display": ["Plus Jakarta Sans", "sans-serif"],
                        "body": ["Noto Sans", "sans-serif"],
                    },
                    borderRadius: {"DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "2xl": "1rem", "full": "9999px"},
                },
            },
        }
    </script>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-background-light dark:bg-background-dark font-display antialiased text-slate-900 dark:text-white selection:bg-primary/30">
<div class="relative flex min-h-screen w-full flex-col overflow-x-hidden max-w-md mx-auto shadow-2xl bg-background-light dark:bg-background-dark">
<!-- Top Navigation -->
<div class="sticky top-0 z-10 flex items-center justify-between p-4 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md">
<button class="flex size-10 items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
<span class="material-symbols-outlined text-slate-900 dark:text-white" style="font-size: 24px;">arrow_back</span>
</button>
<div class="flex items-center gap-2">
<div class="h-1.5 w-1.5 rounded-full bg-slate-300 dark:bg-slate-700"></div>
<div class="h-1.5 w-6 rounded-full bg-primary"></div>
<div class="h-1.5 w-1.5 rounded-full bg-slate-300 dark:bg-slate-700"></div>
</div>
<button class="flex h-10 items-center justify-center px-2 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors">
                Skip
            </button>
</div>
<!-- Main Content -->
<div class="flex flex-col flex-1 px-6 pt-4 pb-24">
<!-- Headlines -->
<div class="mb-8">
<h1 class="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-3">
                    Link your profiles
                </h1>
<p class="text-base font-normal leading-relaxed text-slate-500 dark:text-slate-400">
                    Connect your social accounts to verify your audience and unlock exclusive campaigns suited for you.
                </p>
</div>
<!-- List Items -->
<div class="flex flex-col gap-4">
<!-- Instagram Card -->
<div class="group flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-[#1A1D2D] border border-slate-200 dark:border-white/5 shadow-sm hover:border-primary/50 dark:hover:border-primary/50 transition-all duration-300">
<div class="flex items-center gap-4">
<div class="flex items-center justify-center size-12 rounded-xl bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white shadow-lg shrink-0">
<span class="material-symbols-outlined" style="font-size: 26px;">camera_alt</span>
</div>
<div class="flex flex-col">
<p class="text-base font-bold text-slate-900 dark:text-white">Instagram</p>
<p class="text-sm font-medium text-slate-500 dark:text-slate-400">Not connected</p>
</div>
</div>
<button class="flex items-center justify-center h-9 px-5 rounded-lg bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white text-sm font-semibold hover:bg-slate-200 dark:hover:bg-white/20 transition-colors">
                        Connect
                    </button>
</div>
<!-- TikTok Card -->
<div class="group flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-[#1A1D2D] border border-slate-200 dark:border-white/5 shadow-sm hover:border-primary/50 dark:hover:border-primary/50 transition-all duration-300">
<div class="flex items-center justify-center size-12 rounded-xl bg-black dark:bg-black text-white shadow-lg shrink-0 border border-slate-100 dark:border-white/10">
<span class="material-symbols-outlined" style="font-size: 26px;">music_note</span>
</div>
<div class="flex flex-col">
<p class="text-base font-bold text-slate-900 dark:text-white">TikTok</p>
<p class="text-sm font-medium text-slate-500 dark:text-slate-400">Not connected</p>
</div>
<button class="flex items-center justify-center h-9 px-5 rounded-lg bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white text-sm font-semibold hover:bg-slate-200 dark:hover:bg-white/20 transition-colors">
                        Connect
                    </button>
</div>
<!-- YouTube Card (Connected State Example) -->
<div class="group flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-[#1A1D2D] border border-primary dark:border-primary/50 shadow-sm transition-all duration-300 ring-1 ring-primary/20 dark:ring-primary/20">
<div class="flex items-center gap-4">
<div class="relative flex items-center justify-center size-12 rounded-xl bg-[#FF0000] text-white shadow-lg shrink-0">
<span class="material-symbols-outlined" style="font-size: 26px;">smart_display</span>
<div class="absolute -bottom-1 -right-1 bg-green-500 rounded-full border-2 border-white dark:border-[#1A1D2D] p-0.5">
<span class="material-symbols-outlined text-white block" style="font-size: 10px; font-weight: 900;">check</span>
</div>
</div>
<div class="flex flex-col">
<p class="text-base font-bold text-slate-900 dark:text-white">YouTube</p>
<p class="text-sm font-medium text-primary">@creator_official</p>
</div>
</div>
<button aria-label="Disconnect" class="flex items-center justify-center size-9 rounded-full text-slate-400 dark:text-slate-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 transition-colors">
<span class="material-symbols-outlined" style="font-size: 20px;">close</span>
</button>
</div>
<!-- Twitter/X Card -->
<div class="group flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-[#1A1D2D] border border-slate-200 dark:border-white/5 shadow-sm hover:border-primary/50 dark:hover:border-primary/50 transition-all duration-300">
<div class="flex items-center gap-4">
<div class="flex items-center justify-center size-12 rounded-xl bg-slate-900 dark:bg-slate-800 text-white shadow-lg shrink-0">
<span class="material-symbols-outlined" style="font-size: 26px;">alternate_email</span>
</div>
<div class="flex flex-col">
<p class="text-base font-bold text-slate-900 dark:text-white">Twitter</p>
<p class="text-sm font-medium text-slate-500 dark:text-slate-400">Not connected</p>
</div>
</div>
<button class="flex items-center justify-center h-9 px-5 rounded-lg bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white text-sm font-semibold hover:bg-slate-200 dark:hover:bg-white/20 transition-colors">
                        Connect
                    </button>
</div>
</div>
</div>
<!-- Bottom Actions -->
<div class="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-6 bg-gradient-to-t from-background-light via-background-light to-transparent dark:from-background-dark dark:via-background-dark dark:to-transparent z-20 pointer-events-none flex flex-col items-center">
<div class="pointer-events-auto w-full flex flex-col gap-4">
<p class="text-xs text-center text-slate-400 dark:text-slate-500">
                    We never post without your permission. <a class="underline hover:text-slate-600 dark:hover:text-slate-300" href="#">Read Data Policy</a>.
                </p>
<button class="w-full flex items-center justify-center h-14 rounded-xl bg-primary hover:bg-blue-700 active:scale-[0.98] transition-all text-white font-bold text-lg shadow-lg shadow-primary/25">
                    Continue
                </button>
</div>
</div>
</div>
</body></html>
```


---

## SCREEN: creator_onboarding_form

Path: `screens/creator_onboarding_form/index.html`

```html
<!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>CreatorX Onboarding</title>
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#1337ec",
                        "background-light": "#f6f6f8",
                        "background-dark": "#101322",
                        "surface-dark": "#1a1d2d",
                        "surface-light": "#ffffff",
                    },
                    fontFamily: {
                        "display": ["Plus Jakarta Sans", "sans-serif"]
                    },
                    borderRadius: {"DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "2xl": "1rem", "full": "9999px"},
                },
            },
        }
    </script>
<style>
        /* Custom scrollbar hide for cleaner mobile look */
        .no-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="font-display bg-background-light dark:bg-background-dark text-slate-900 dark:text-white antialiased overflow-x-hidden selection:bg-primary selection:text-white">
<div class="relative flex h-full min-h-screen w-full flex-col max-w-md mx-auto bg-background-light dark:bg-background-dark shadow-2xl overflow-hidden">
<!-- Header / Progress -->
<div class="flex flex-col w-full pt-8 pb-4 px-6 sticky top-0 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm z-20">
<div class="flex items-center justify-between mb-6">
<button class="flex items-center justify-center w-10 h-10 -ml-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
<span class="material-symbols-outlined text-2xl">arrow_back</span>
</button>
<div class="text-sm font-semibold text-slate-500 dark:text-slate-400">Step 1 of 4</div>
<button class="text-sm font-semibold text-primary hover:text-primary/80 transition-colors">Skip</button>
</div>
<!-- Progress Indicators -->
<div class="flex w-full flex-row items-center justify-center gap-2">
<div class="h-1.5 flex-1 rounded-full bg-primary"></div>
<div class="h-1.5 flex-1 rounded-full bg-slate-200 dark:bg-surface-dark"></div>
<div class="h-1.5 flex-1 rounded-full bg-slate-200 dark:bg-surface-dark"></div>
<div class="h-1.5 flex-1 rounded-full bg-slate-200 dark:bg-surface-dark"></div>
</div>
</div>
<!-- Scrollable Content -->
<div class="flex-1 flex flex-col px-6 pb-24 overflow-y-auto no-scrollbar">
<!-- Section 1: Intro -->
<div class="animate-fade-in-up">
<h1 class="text-3xl font-bold leading-tight tracking-tight mb-2 pt-2">
                    Let's define <span class="text-primary">your style.</span>
</h1>
<p class="text-slate-600 dark:text-slate-400 text-base font-normal leading-relaxed mb-8">
                    Select the categories that best describe your content. This helps brands find you for relevant campaigns.
                </p>
</div>
<!-- Niche Selection -->
<div class="mb-8">
<label class="block text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-500 mb-4 pl-1">
                    Select Niche (Max 3)
                </label>
<div class="flex gap-3 flex-wrap">
<!-- Active Chip -->
<button class="group flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-full border border-primary bg-primary/10 dark:bg-primary/20 px-5 transition-all active:scale-95">
<span class="material-symbols-outlined text-lg text-primary">check</span>
<p class="text-primary text-sm font-semibold">Lifestyle</p>
</button>
<!-- Inactive Chips -->
<button class="group flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-full border border-slate-200 dark:border-surface-dark bg-white dark:bg-surface-dark px-5 hover:border-slate-300 dark:hover:border-slate-600 transition-all active:scale-95">
<p class="text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white text-sm font-medium">Fashion</p>
</button>
<button class="group flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-full border border-slate-200 dark:border-surface-dark bg-white dark:bg-surface-dark px-5 hover:border-slate-300 dark:hover:border-slate-600 transition-all active:scale-95">
<p class="text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white text-sm font-medium">Tech</p>
</button>
<!-- Active Chip Example 2 -->
<button class="group flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-full border border-primary bg-primary/10 dark:bg-primary/20 px-5 transition-all active:scale-95">
<span class="material-symbols-outlined text-lg text-primary">check</span>
<p class="text-primary text-sm font-semibold">Travel</p>
</button>
<button class="group flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-full border border-slate-200 dark:border-surface-dark bg-white dark:bg-surface-dark px-5 hover:border-slate-300 dark:hover:border-slate-600 transition-all active:scale-95">
<p class="text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white text-sm font-medium">Beauty</p>
</button>
<button class="group flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-full border border-slate-200 dark:border-surface-dark bg-white dark:bg-surface-dark px-5 hover:border-slate-300 dark:hover:border-slate-600 transition-all active:scale-95">
<p class="text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white text-sm font-medium">Gaming</p>
</button>
<button class="group flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-full border border-slate-200 dark:border-surface-dark bg-white dark:bg-surface-dark px-5 hover:border-slate-300 dark:hover:border-slate-600 transition-all active:scale-95">
<p class="text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white text-sm font-medium">Fitness</p>
</button>
<button class="group flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-full border border-slate-200 dark:border-surface-dark bg-white dark:bg-surface-dark px-5 hover:border-slate-300 dark:hover:border-slate-600 transition-all active:scale-95">
<p class="text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white text-sm font-medium">Food &amp; Drink</p>
</button>
</div>
</div>
<!-- Platform Selection -->
<div class="mb-6">
<h2 class="text-xl font-bold leading-tight mb-4 flex items-center gap-2">
                    Primary Platforms
                    <span class="material-symbols-outlined text-slate-500 text-lg cursor-help" title="Where do you post most often?">info</span>
</h2>
<div class="grid grid-cols-1 gap-3">
<!-- Instagram Card (Active) -->
<div class="relative group cursor-pointer">
<input checked="" class="peer sr-only" id="platform_ig" type="checkbox"/>
<label class="flex items-center justify-between p-4 rounded-xl border-2 border-transparent bg-white dark:bg-surface-dark peer-checked:border-primary peer-checked:bg-primary/5 dark:peer-checked:bg-primary/10 transition-all shadow-sm" for="platform_ig">
<div class="flex items-center gap-4">
<div class="w-10 h-10 rounded-lg bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 flex items-center justify-center text-white">
<svg class="w-6 h-6 fill-current" viewbox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"></path></svg>
</div>
<div class="flex flex-col">
<span class="text-base font-bold text-slate-900 dark:text-white">Instagram</span>
<span class="text-xs text-slate-500">Connect account</span>
</div>
</div>
<div class="h-6 w-6 rounded-full border-2 border-slate-300 dark:border-slate-600 peer-checked:border-primary peer-checked:bg-primary flex items-center justify-center">
<span class="material-symbols-outlined text-white text-sm opacity-0 peer-checked:opacity-100 font-bold">check</span>
</div>
</label>
</div>
<!-- TikTok Card -->
<div class="relative group cursor-pointer">
<input class="peer sr-only" id="platform_tk" type="checkbox"/>
<label class="flex items-center justify-between p-4 rounded-xl border-2 border-transparent bg-white dark:bg-surface-dark peer-checked:border-primary peer-checked:bg-primary/5 dark:peer-checked:bg-primary/10 transition-all shadow-sm" for="platform_tk">
<div class="flex items-center gap-4">
<div class="w-10 h-10 rounded-lg bg-black dark:bg-[#25F4EE]/10 flex items-center justify-center text-white relative overflow-hidden">
<!-- Stylized TikTok approximation with icon -->
<span class="z-10 relative">
<svg class="w-6 h-6 fill-white" viewbox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.65-1.58-1.09v8.32c.03 2.51-1.75 4.86-4.24 5.53-2.61.69-5.46-.38-7-2.6-1.54-2.21-1.37-5.32.43-7.33 1.16-1.29 2.92-1.89 4.61-1.56v3.97c-1.3-.39-2.73.19-3.41 1.38-.68 1.19-.38 2.76.71 3.63 1.09.87 2.69.76 3.66-.25.54-.56.84-1.32.83-2.1v-16.9z"></path></svg>
</span>
<div class="absolute inset-0 bg-gradient-to-br from-[#00f2ea] to-[#ff0050] opacity-30 mix-blend-overlay"></div>
</div>
<div class="flex flex-col">
<span class="text-base font-bold text-slate-900 dark:text-white">TikTok</span>
<span class="text-xs text-slate-500">Connect account</span>
</div>
</div>
<div class="h-6 w-6 rounded-full border-2 border-slate-300 dark:border-slate-600 peer-checked:border-primary peer-checked:bg-primary flex items-center justify-center">
<span class="material-symbols-outlined text-white text-sm opacity-0 peer-checked:opacity-100 font-bold">check</span>
</div>
</label>
</div>
<!-- YouTube Card -->
<div class="relative group cursor-pointer">
<input class="peer sr-only" id="platform_yt" type="checkbox"/>
<label class="flex items-center justify-between p-4 rounded-xl border-2 border-transparent bg-white dark:bg-surface-dark peer-checked:border-primary peer-checked:bg-primary/5 dark:peer-checked:bg-primary/10 transition-all shadow-sm" for="platform_yt">
<div class="flex items-center gap-4">
<div class="w-10 h-10 rounded-lg bg-[#FF0000] flex items-center justify-center text-white">
<svg class="w-6 h-6 fill-current" viewbox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"></path></svg>
</div>
<div class="flex flex-col">
<span class="text-base font-bold text-slate-900 dark:text-white">YouTube</span>
<span class="text-xs text-slate-500">Connect account</span>
</div>
</div>
<div class="h-6 w-6 rounded-full border-2 border-slate-300 dark:border-slate-600 peer-checked:border-primary peer-checked:bg-primary flex items-center justify-center">
<span class="material-symbols-outlined text-white text-sm opacity-0 peer-checked:opacity-100 font-bold">check</span>
</div>
</label>
</div>
</div>
</div>
<!-- Quick Bio Input -->
<div class="mb-4">
<h2 class="text-xl font-bold leading-tight mb-2">Short Bio</h2>
<p class="text-sm text-slate-500 mb-4">A one-liner to introduce yourself to brands.</p>
<div class="relative">
<input class="w-full bg-white dark:bg-surface-dark border-transparent focus:border-primary focus:ring-0 rounded-xl p-4 text-base placeholder-slate-400 dark:placeholder-slate-600 dark:text-white shadow-sm transition-all outline-none" placeholder="e.g. Creating daily tech reviews for Gen Z..." type="text"/>
</div>
</div>
</div>
<!-- Sticky Footer -->
<div class="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-background-light via-background-light to-transparent dark:from-background-dark dark:via-background-dark dark:to-transparent pt-12 z-30 pointer-events-none">
<button class="pointer-events-auto w-full h-14 rounded-xl bg-primary hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-lg shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2 group">
                Continue
                <span class="material-symbols-outlined transition-transform group-hover:translate-x-1">arrow_forward</span>
</button>
</div>
</div>
</body></html>
```


---

## SCREEN: creatorx_splash_screen

Path: `screens/creatorx_splash_screen/index.html`

```html
<!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>CreatorX Splash Screen</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&amp;family=Noto+Sans:wght@400;500;600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#1337ec",
                        "background-light": "#f6f6f8",
                        "background-dark": "#101322",
                    },
                    fontFamily: {
                        "display": ["Plus Jakarta Sans", "sans-serif"],
                        "body": ["Noto Sans", "sans-serif"],
                    },
                    borderRadius: {"DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "full": "9999px"},
                    animation: {
                        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                    }
                },
            },
        }
    </script>
<style>
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        /* Custom subtle background pattern */
        .bg-grid-pattern {
            background-image: radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px);
            background-size: 24px 24px;
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-background-light dark:bg-background-dark font-display min-h-screen flex flex-col relative overflow-hidden selection:bg-primary/30 selection:text-white">
<!-- Background Gradient Mesh -->
<div class="absolute inset-0 bg-background-dark">
<!-- Radial gradient to create the 'deep black' feel in the corners while keeping the center illuminated -->
<div class="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-background-dark via-background-dark to-black opacity-80"></div>
<!-- Subtle Grid Texture -->
<div class="absolute inset-0 bg-grid-pattern opacity-20"></div>
<!-- Primary Color Glow behind logo -->
<div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/20 rounded-full blur-[100px] animate-pulse-slow"></div>
</div>
<!-- Main Content Area -->
<main class="relative z-10 flex-1 flex flex-col items-center justify-center w-full max-w-md mx-auto px-6">
<!-- Logo Section -->
<div class="flex flex-col items-center gap-8 mb-12">
<!-- Custom Logo Mark -->
<div class="relative group">
<!-- Outer glow ring -->
<div class="absolute -inset-1 bg-gradient-to-r from-primary to-blue-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
<!-- Logo Container -->
<div class="relative w-24 h-24 bg-[#0B0D15] rounded-2xl border border-white/5 shadow-2xl flex items-center justify-center overflow-hidden">
<!-- Glass shine effect -->
<div class="absolute top-0 w-full h-1/2 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>
<!-- The "X" Symbol Construction -->
<div class="relative w-12 h-12">
<div class="absolute inset-0 flex items-center justify-center">
<!-- Left stroke -->
<div class="w-3 h-14 bg-gradient-to-b from-primary to-blue-400 rounded-full rotate-45 transform origin-center shadow-[0_0_15px_rgba(19,55,236,0.5)]"></div>
<!-- Right stroke (with cut-out effect simulation via layering or just crossing) -->
<div class="absolute w-3 h-14 bg-gradient-to-t from-primary to-blue-600 rounded-full -rotate-45 transform origin-center mix-blend-screen"></div>
</div>
</div>
</div>
</div>
<!-- Headline Text -->
<div class="text-center space-y-2">
<h1 class="text-white text-[40px] font-extrabold tracking-tight leading-none drop-shadow-xl">
                    Creator<span class="text-primary">X</span>
</h1>
<!-- Tagline / Body Text -->
<p class="text-slate-400 text-sm font-medium tracking-[0.2em] uppercase opacity-0 animate-[fadeIn_1s_ease-out_0.5s_forwards]" style="animation-fill-mode: both;">
                    Monetize Your Influence
                </p>
</div>
</div>
</main>
<!-- Footer / Meta Section -->
<footer class="relative z-10 w-full pb-10 flex flex-col items-center justify-center gap-5">
<!-- Minimal Loader -->
<div class="w-6 h-6 relative">
<div class="absolute inset-0 border-2 border-primary/30 rounded-full"></div>
<div class="absolute inset-0 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
</div>
<!-- Meta Info -->
<p class="text-[#555970] text-xs font-normal tracking-wide">
            v1.0.2
        </p>
</footer>
<!-- Image Preloads (Hidden) - Representing future dashboard assets -->
<div class="hidden">
<div data-alt="Abstract blue gradient background pattern" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuArF434jT9Nenk2mcBoAkqU3EVJ128XUxPLn4pA1tRffsqj-CYhjh6_caMfhRW-3ka9pmki3R5vzS8lTsnUJClS9AGcIJoqGgOkZBywWUmZvH1sGu7RuQFHEbsR_tEAneCSLasKwMlk-5DoqHh9Z9qWz_sxbIihZg20wOSZlYqm7WFuIcFtXEahq8oAJy0w2LgECV3AgkgrwkBXv0Ke-9ktfc4uAZVpN4H6zAgCt84yCte9QhDUGDe4eKSglluGElGrFu2sUepLi-8');"></div>
</div>
</body></html>
```


---

## SCREEN: login_with_phone___otp

Path: `screens/login_with_phone___otp/index.html`

```html
<!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>CreatorX Login</title>
<!-- Fonts -->
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&amp;display=swap" rel="stylesheet"/>
<!-- Material Symbols -->
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<!-- Tailwind CSS -->
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<!-- Theme Configuration -->
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#1337ec",
                        "background-light": "#f6f6f8",
                        "background-dark": "#101322",
                    },
                    fontFamily: {
                        "display": ["Plus Jakarta Sans", "sans-serif"]
                    },
                    borderRadius: {"DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "full": "9999px"},
                },
            },
        }
    </script>
<style>
        /* Custom scrollbar for clean look */
        ::-webkit-scrollbar {
            width: 6px;
        }
        ::-webkit-scrollbar-track {
            background: transparent; 
        }
        ::-webkit-scrollbar-thumb {
            background: #334155; 
            border-radius: 10px;
        }
        /* Remove arrows from number input */
        input[type=number]::-webkit-inner-spin-button, 
        input[type=number]::-webkit-outer-spin-button { 
            -webkit-appearance: none; 
            margin: 0; 
        }
        .glass-effect {
            background: rgba(16, 19, 34, 0.7);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display antialiased min-h-screen flex flex-col items-center justify-center py-8">
<!-- Background Elements -->
<div class="fixed inset-0 overflow-hidden pointer-events-none z-0">
<div class="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px]" data-alt="Abstract blue glow gradient in top left corner"></div>
<div class="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-purple-900/20 rounded-full blur-[100px]" data-alt="Abstract purple glow gradient in bottom right corner"></div>
</div>
<!-- Mobile Screen Container -->
<main class="relative z-10 w-full max-w-[420px] bg-white dark:bg-[#151725] min-h-[800px] shadow-2xl overflow-hidden rounded-[40px] border border-slate-200 dark:border-slate-800 flex flex-col">
<!-- Status Bar Area (Decorative) -->
<div class="h-12 w-full flex justify-between items-center px-6 pt-2 select-none">
<span class="text-xs font-bold dark:text-white">9:41</span>
<div class="flex gap-1.5 items-center">
<span class="material-symbols-outlined text-[18px] dark:text-white">signal_cellular_alt</span>
<span class="material-symbols-outlined text-[18px] dark:text-white">wifi</span>
<span class="material-symbols-outlined text-[18px] dark:text-white">battery_full</span>
</div>
</div>
<!-- Header -->
<div class="px-4 py-2 flex items-center justify-between">
<button class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-white/5 transition-colors text-slate-900 dark:text-white">
<span class="material-symbols-outlined">arrow_back</span>
</button>
<div class="text-sm font-bold tracking-widest uppercase text-primary">CreatorX</div>
<button class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-white/5 transition-colors text-slate-400 dark:text-slate-500">
<span class="material-symbols-outlined">help</span>
</button>
</div>
<!-- Scrollable Content -->
<div class="flex-1 overflow-y-auto pb-6">
<!-- STATE 1: Phone Number Input -->
<section class="px-6 pt-8 pb-10">
<div class="mb-8">
<h1 class="text-3xl font-bold tracking-tight mb-3 text-slate-900 dark:text-white">Welcome back</h1>
<p class="text-slate-500 dark:text-slate-400 text-base leading-relaxed">
                        Enter your phone number to access your creator dashboard.
                    </p>
</div>
<div class="space-y-6">
<!-- Phone Input Group -->
<div>
<label class="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Phone Number</label>
<div class="flex gap-3">
<!-- Country Code -->
<div class="relative w-28 shrink-0">
<select class="w-full h-14 bg-slate-50 dark:bg-[#1c1d27] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2 appearance-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-medium text-lg">
<option value="us">🇺🇸 +1</option>
<option value="uk">🇬🇧 +44</option>
<option value="ca">🇨🇦 +1</option>
<option value="au">🇦🇺 +61</option>
</select>
<div class="absolute inset-y-0 right-2 flex items-center pointer-events-none">
<span class="material-symbols-outlined text-slate-400 text-sm">expand_more</span>
</div>
</div>
<!-- Number Input -->
<div class="relative flex-1">
<input class="w-full h-14 bg-slate-50 dark:bg-[#1c1d27] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-2 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-medium text-lg" placeholder="555 000-0000" type="tel"/>
</div>
</div>
</div>
<!-- Button State 1 -->
<button class="w-full h-14 bg-primary hover:bg-blue-700 text-white font-bold rounded-xl text-lg shadow-lg shadow-primary/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                        Get Code
                        <span class="material-symbols-outlined text-[20px]">arrow_forward</span>
</button>
<p class="text-center text-xs text-slate-400 dark:text-slate-500 mt-4 leading-relaxed px-4">
                        By continuing, you agree to CreatorX's 
                        <a class="text-primary hover:underline" href="#">Terms of Service</a> and 
                        <a class="text-primary hover:underline" href="#">Privacy Policy</a>.
                    </p>
</div>
</section>
<!-- Divider for Demo Purposes -->
<div class="flex items-center gap-4 px-6 py-8 opacity-30">
<div class="h-px bg-slate-500 flex-1"></div>
<span class="text-xs uppercase tracking-widest font-bold text-slate-500">Step 2 View</span>
<div class="h-px bg-slate-500 flex-1"></div>
</div>
<!-- STATE 2: OTP Verification (Visual Demo) -->
<section class="px-6 pb-8">
<div class="mb-8">
<h2 class="text-2xl font-bold tracking-tight mb-2 text-slate-900 dark:text-white">Verify Account</h2>
<p class="text-slate-500 dark:text-slate-400 text-sm">
                        Enter the 4-digit code sent to <span class="text-slate-800 dark:text-slate-200 font-medium">+1 555 000-0000</span>
</p>
</div>
<div class="space-y-8">
<!-- OTP Inputs -->
<div class="flex justify-between gap-3">
<input class="w-16 h-16 text-center text-3xl font-bold bg-slate-50 dark:bg-[#1c1d27] border border-primary dark:border-primary text-slate-900 dark:text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary caret-primary selection:bg-primary/30 shadow-[0_0_15px_rgba(19,55,236,0.15)]" maxlength="1" type="text" value="4"/>
<input class="w-16 h-16 text-center text-3xl font-bold bg-slate-50 dark:bg-[#1c1d27] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent caret-primary" maxlength="1" type="text"/>
<input class="w-16 h-16 text-center text-3xl font-bold bg-slate-50 dark:bg-[#1c1d27] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent caret-primary" maxlength="1" type="text"/>
<input class="w-16 h-16 text-center text-3xl font-bold bg-slate-50 dark:bg-[#1c1d27] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent caret-primary" maxlength="1" type="text"/>
</div>
<!-- Error State Example (Hidden by default logic, visible here for design) -->
<div class="hidden flex items-center gap-2 text-red-500 bg-red-500/10 p-3 rounded-lg">
<span class="material-symbols-outlined text-[18px]">error</span>
<span class="text-sm font-medium">Invalid code. Please try again.</span>
</div>
<!-- Resend Timer -->
<div class="text-center">
<p class="text-sm text-slate-500 dark:text-slate-400">
                            Didn't receive code? 
                            <button class="text-primary font-bold hover:text-blue-400 ml-1">Resend in 0:45</button>
</p>
</div>
<!-- Button State 2 -->
<button class="w-full h-14 bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 font-bold rounded-xl text-lg cursor-not-allowed flex items-center justify-center gap-2">
                        Verify
                    </button>
</div>
</section>
</div>
<!-- Bottom Safe Area (Simulated) -->
<div class="h-6 w-full"></div>
</main>
<!-- Context Label (Outside device) -->
<div class="fixed bottom-4 text-xs text-slate-400 dark:text-slate-600 font-mono">
        CreatorX iOS Login Concept
    </div>
</body></html>
```


---

## SCREEN: messages__chat_with_brands

Path: `screens/messages__chat_with_brands/index.html`

```html
<!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>CreatorX - Messages</title>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;700;800&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#1337ec",
                        "background-light": "#f6f6f8",
                        "background-dark": "#101322",
                        "surface-dark": "#1c1f2e",
                        "bubble-dark": "#282b39",
                    },
                    fontFamily: {
                        "display": ["Plus Jakarta Sans", "sans-serif"]
                    },
                    borderRadius: {"DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "2xl": "1rem", "full": "9999px"},
                },
            },
        }
    </script>
<style>
        /* Custom scrollbar for webkit to ensure clean look */
        ::-webkit-scrollbar {
            width: 6px;
        }
        ::-webkit-scrollbar-track {
            background: transparent; 
        }
        ::-webkit-scrollbar-thumb {
            background: #282b39; 
            border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
            background: #3e4255; 
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-background-light dark:bg-background-dark font-display antialiased h-screen flex flex-col overflow-hidden text-gray-900 dark:text-white selection:bg-primary selection:text-white">
<!-- Top Header -->
<header class="shrink-0 z-20 bg-background-light dark:bg-background-dark border-b border-gray-200 dark:border-gray-800">
<!-- Safe Area Top Spacer (simulated for iOS) -->
<div class="h-0 md:h-2 w-full"></div>
<div class="flex items-center p-4 justify-between">
<div class="flex items-center gap-3">
<button class="flex items-center justify-center text-gray-900 dark:text-white hover:text-primary transition-colors p-1 -ml-2">
<span class="material-symbols-outlined !text-[28px]">chevron_left</span>
</button>
<div class="relative">
<div class="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 ring-2 ring-gray-200 dark:ring-gray-700" data-alt="Nike Sportswear Brand Logo" style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuAIAwuwN7bk4ESQdujT3CQhaDZSti_MIrt294VL-iy_UZGQoJpCeHR5m_xTTARrwoI2jsp1kNVdiTWJT6gBIo1krrUkMyTd6L8R1vTkwBWwjv8EAp0gD3C777Zmh_5bwNCk7zK6_XA4l4bWgJ0tBBr5Ewk4UPxNVBsk3C5tTJFwaY3UOaf31S9ucrbktcgZgoaFWp4FhE3tV_T2UiZXkCZ3jUe77J030z6TMXj349aw9O4P9V9MRmLbVfc1yAO09RmNeYCfx4pu7xA");'>
</div>
<!-- Online indicator -->
<div class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-background-dark rounded-full"></div>
</div>
<div class="flex flex-col">
<div class="flex items-center gap-1">
<h2 class="text-gray-900 dark:text-white text-base font-bold leading-tight">Nike Sportswear</h2>
<span class="material-symbols-outlined text-blue-500 text-[16px]" title="Verified">verified</span>
</div>
<p class="text-gray-500 dark:text-gray-400 text-xs font-medium truncate max-w-[180px]">Re: Summer '24 Running...</p>
</div>
</div>
<button class="flex items-center justify-center text-gray-900 dark:text-white p-2 rounded-full hover:bg-gray-200 dark:hover:bg-surface-dark transition-colors">
<span class="material-symbols-outlined">more_vert</span>
</button>
</div>
<!-- Campaign Context Banner (Optional visual separator) -->
<div class="bg-primary/5 dark:bg-primary/10 px-4 py-1.5 flex items-center justify-center border-t border-b border-primary/10 dark:border-primary/5">
<span class="text-xs font-semibold text-primary tracking-wide uppercase">Campaign Active</span>
</div>
</header>
<!-- Chat Area -->
<main class="flex-1 overflow-y-auto w-full p-4 flex flex-col gap-6 relative">
<!-- Date Separator -->
<div class="flex justify-center w-full py-2">
<span class="text-xs font-medium text-gray-400 bg-gray-200 dark:bg-surface-dark px-3 py-1 rounded-full">Today, 10:23 AM</span>
</div>
<!-- Brand Message -->
<div class="flex items-end gap-3 w-full">
<div class="bg-center bg-no-repeat aspect-square bg-cover rounded-full w-8 h-8 shrink-0 mb-1" data-alt="Nike Brand Avatar small" style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuBZjAoBMchQ-QoxzUpGmbzkIbTW1btXde2_zuwDS_at2W_P7Hq7u0qVaWnX_OkwdPpIsT9-R9x3Ue7UX20WSXaR-V6cZtLG1GBdhsJurCcjdtyiP7D0Zg1wRXYUfjYXFjXrykKPfRvvYWCoC9eFVj1GTg5XabUcioRVu0pq48yKJpwaE2eWqHgKkxkk0dBM73565NLOkkGe_jgi0WD-BRxUnf4RMStqSd8nw6Zv-utD2Bl_HXtZNWJMcPhysdePYurewHvQLGGguHw");'>
</div>
<div class="flex flex-col gap-1 items-start max-w-[80%]">
<div class="p-4 bg-gray-200 dark:bg-bubble-dark rounded-2xl rounded-bl-none text-gray-800 dark:text-gray-100 shadow-sm">
<p class="text-sm md:text-base font-normal leading-relaxed">
                        Hi Alex, we loved the draft! Can you make the logo slightly larger in the second frame?
                    </p>
</div>
<span class="text-[11px] text-gray-400 pl-1">10:30 AM</span>
</div>
</div>
<!-- Creator Message (User) -->
<div class="flex items-end gap-3 w-full justify-end">
<div class="flex flex-col gap-1 items-end max-w-[80%]">
<div class="bg-primary text-white p-4 rounded-2xl rounded-br-none shadow-md">
<p class="text-sm md:text-base font-normal leading-relaxed">
                        Sure thing! Just uploaded the revised version. Let me know if this works.
                    </p>
</div>
<!-- Attachment -->
<div class="mt-1 relative group cursor-pointer overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
<div class="bg-center bg-no-repeat aspect-video bg-cover w-60 md:w-72 transition-transform duration-500 group-hover:scale-105" data-alt="Video thumbnail of a runner in neon sportswear on a track" style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuBJDnrciWAMcQBz83f1KoAdyuDfjgyRzd_YCp228WjNLEDBfz50riemTpUs_7j9KjDixNB0s6fXhHYSRd631qsHU_kUMAmLbU2hXFOTm9Ii5QwGnVl93pwIxQqkb50oJRBnmDX_JEavDUcZ8GiB2Naa8wqMpTw42t-LnqU5cRizvXFzIvB872EXDo9SOChzmasEUU3OdOqEkbhuzNYsx-OCWqMULlSGbgxEFuUULfmfycsXkU0qH6tsmlkOt2dJK91EpUk-2dtHe2o");'>
<div class="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/20 transition-colors">
<div class="bg-white/20 backdrop-blur-md rounded-full p-2">
<span class="material-symbols-outlined text-white">play_arrow</span>
</div>
</div>
</div>
<div class="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm p-2 flex items-center justify-between">
<span class="text-[10px] text-white font-medium truncate px-1">Draft_v2.mp4</span>
<span class="text-[10px] text-gray-300">12 MB</span>
</div>
</div>
<div class="flex items-center gap-1 pr-1">
<span class="text-[11px] text-gray-400">10:45 AM</span>
<span class="material-symbols-outlined text-[14px] text-primary" title="Read">done_all</span>
</div>
</div>
</div>
<!-- Brand Message -->
<div class="flex items-end gap-3 w-full">
<div class="bg-center bg-no-repeat aspect-square bg-cover rounded-full w-8 h-8 shrink-0 mb-1" data-alt="Nike Brand Avatar small" style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuBliDVfnjkiDWkoGfQnyI_3E-7mVTCyMuffS3ZthxEuB4a9uMgo4qtl21rYFfGDryNUWHIJKF0rNx21Hz-50CQ-NjkqQNPeN7UE_Q6Dpe8JHFrb3Qc-u3l5rY_yMQYa6dMzrlDeWHGjTHGVqi5xr56YwJnWTo7w1d5nCFkAsEnqH5ikCwGITRe-Ax6ZbeUeDF_z6wSHY0W1_c4ffDuMm5SAvzpXkiyD9LM3roP5ApNuA5w0RtKKGBLZTy4waFNYQZW0MASbNZRAPsg");'>
</div>
<div class="flex flex-col gap-1 items-start max-w-[80%]">
<div class="p-4 bg-gray-200 dark:bg-bubble-dark rounded-2xl rounded-bl-none text-gray-800 dark:text-gray-100 shadow-sm">
<p class="text-sm md:text-base font-normal leading-relaxed">
                        Perfect. Approved for posting! 🚀
                    </p>
</div>
<span class="text-[11px] text-gray-400 pl-1">11:02 AM</span>
</div>
</div>
<!-- Spacer for scrolling above input -->
<div class="h-4"></div>
</main>
<!-- Bottom Input Area -->
<footer class="shrink-0 z-20 bg-background-light dark:bg-background-dark border-t border-gray-200 dark:border-gray-800 p-4 pb-6 md:pb-4">
<!-- Quick Action Suggestion (Optional contextual helper) -->
<div class="flex gap-2 mb-3 overflow-x-auto no-scrollbar">
<button class="whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 hover:bg-primary/20 border border-primary/20 text-xs font-medium text-primary transition-colors">
<span class="material-symbols-outlined text-[16px]">upload_file</span>
                Submit Deliverable
             </button>
<button class="whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-surface-dark hover:bg-gray-200 dark:hover:bg-bubble-dark border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-600 dark:text-gray-300 transition-colors">
<span class="material-symbols-outlined text-[16px]">calendar_month</span>
                Schedule Post
             </button>
</div>
<div class="flex items-end gap-3 w-full">
<button class="shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 dark:bg-surface-dark text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors">
<span class="material-symbols-outlined text-[24px]">add</span>
</button>
<div class="flex-1 bg-gray-100 dark:bg-surface-dark rounded-2xl flex items-center min-h-[48px] border border-transparent focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/50 transition-all">
<textarea class="w-full bg-transparent border-none text-gray-900 dark:text-white placeholder-gray-500 text-sm px-4 py-3 focus:ring-0 resize-none max-h-32" placeholder="Message Nike Sportswear..." rows="1" style="min-height: 48px;"></textarea>
<button class="mr-2 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
<span class="material-symbols-outlined text-[20px]">sentiment_satisfied</span>
</button>
</div>
<button class="shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-primary text-white shadow-lg shadow-primary/30 hover:bg-blue-600 hover:scale-105 active:scale-95 transition-all">
<span class="material-symbols-outlined text-[24px] ml-0.5">send</span>
</button>
</div>
<!-- iOS Home Indicator Spacer -->
<div class="h-1 w-full"></div>
</footer>
</body></html>
```


---

## SCREEN: my_docs

Path: `screens/my_docs/index.html`

```html
<!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>CreatorX - My Docs</title>
<!-- Google Fonts -->
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<!-- Tailwind CSS -->
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<!-- Theme Config -->
<script id="tailwind-config">
      tailwind.config = {
        darkMode: "class",
        theme: {
          extend: {
            colors: {
              "primary": "#1337ec",
              "background-light": "#f6f6f8",
              "background-dark": "#101322",
              "surface-dark": "#1a1d2d", 
              "surface-light": "#ffffff",
            },
            fontFamily: {
              "display": ["Plus Jakarta Sans", "sans-serif"]
            },
            borderRadius: {"DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "2xl": "1rem", "full": "9999px"},
          },
        },
      }
    </script>
<style>
        /* Custom scrollbar hiding */
        .no-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display min-h-screen relative overflow-x-hidden selection:bg-primary selection:text-white">
<!-- Top App Bar -->
<header class="sticky top-0 z-20 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md border-b border-gray-200 dark:border-white/5 px-4 pt-4 pb-2">
<div class="flex items-center justify-between h-14">
<h1 class="text-2xl font-bold tracking-tight">My Docs</h1>
<div class="flex items-center gap-2">
<button class="flex items-center justify-center w-10 h-10 rounded-full bg-transparent hover:bg-gray-200 dark:hover:bg-white/10 transition-colors text-slate-600 dark:text-slate-300">
<span class="material-symbols-outlined">notifications</span>
</button>
<button class="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 dark:bg-surface-dark overflow-hidden border border-gray-300 dark:border-white/10">
<img alt="Creator Profile Picture" class="w-full h-full object-cover" data-alt="Portrait of a female creator with sunglasses" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCY_siomTOW0HqJ8LgeiZM6Mzi39XfCzdG-haevLqaGFcRFEIj7lsTOUV90PXXDvcPqD8ulyV-ukT44GZbtkvBoZmXJfmpS1W_e_or0CFoWRp9J8k1RBPoJVPtvSFk5VYFw0xsMlZX9E1mw9YQTpukzBkng7OgYlHAKwVqcA_ABtiYBaRnHtZ2AWDZhLuKXzQLnGVcRDf9OTBJs-sbeIGHc22hcTiYDKAqSLJSsmhemIylDA6j73YuLKeo0JvNFWH8mO5bBYFh12Sc"/>
</button>
</div>
</div>
</header>
<main class="pb-28"> <!-- Bottom padding for FAB and spacing -->
<!-- Search Bar -->
<div class="px-4 py-4">
<div class="relative group">
<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
<span class="material-symbols-outlined text-gray-400">search</span>
</div>
<input class="block w-full pl-10 pr-3 py-3 border-none rounded-xl leading-5 bg-white dark:bg-surface-dark text-slate-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary sm:text-sm shadow-sm" placeholder="Search contracts, invoices..." type="text"/>
<div class="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer">
<span class="material-symbols-outlined text-gray-400 hover:text-primary transition-colors">tune</span>
</div>
</div>
</div>
<!-- Filter Chips -->
<div class="flex gap-3 px-4 overflow-x-auto no-scrollbar pb-2">
<button class="flex whitespace-nowrap h-9 px-5 items-center justify-center rounded-full bg-primary text-white text-sm font-semibold shadow-lg shadow-primary/20 transition-transform active:scale-95">
                All
            </button>
<button class="flex whitespace-nowrap h-9 px-5 items-center justify-center rounded-full bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/5 text-slate-600 dark:text-gray-300 text-sm font-medium transition-colors hover:bg-gray-50 dark:hover:bg-white/5 active:scale-95">
                Contracts
            </button>
<button class="flex whitespace-nowrap h-9 px-5 items-center justify-center rounded-full bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/5 text-slate-600 dark:text-gray-300 text-sm font-medium transition-colors hover:bg-gray-50 dark:hover:bg-white/5 active:scale-95">
                Invoices
            </button>
<button class="flex whitespace-nowrap h-9 px-5 items-center justify-center rounded-full bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/5 text-slate-600 dark:text-gray-300 text-sm font-medium transition-colors hover:bg-gray-50 dark:hover:bg-white/5 active:scale-95">
                Media Kits
            </button>
</div>
<!-- Recent Uploads Section -->
<section class="mt-6">
<div class="px-4 flex justify-between items-center mb-3">
<h3 class="text-lg font-bold text-slate-900 dark:text-white">Recent Uploads</h3>
<button class="text-primary text-sm font-semibold hover:text-blue-400">View All</button>
</div>
<div class="flex overflow-x-auto gap-4 px-4 pb-4 no-scrollbar">
<!-- Card 1 -->
<div class="flex-shrink-0 w-40 flex flex-col gap-2 group cursor-pointer">
<div class="relative w-40 h-28 rounded-xl overflow-hidden bg-surface-dark border border-white/5 shadow-md">
<div class="absolute inset-0 bg-cover bg-center opacity-80 group-hover:opacity-100 transition-opacity duration-300" data-alt="Abstract business document background with pen and paper" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuBbM9fsLQAN8Lor8V_XFtvkNYr2gJJq8PWjsvAjjs3uWGc8fQe6yyc9Qw7AwMVy3whMD2JIbJ5H58ukK8YwPQe00mlVbnzMdn8mcMVQYnNV6yI0Gwvn2npsboXWbgZ8vVCzmKLKzCOaLNW0yBIwPpfZzObGseyQU5it5MrkUBkftNRqE9w2o33aVZtmm6ZhzdL2n0kBCc-t79giuikkP0c2tC6yyx-oVPe_MGd0T3eHEav690vy-HivwCWfjnK1hSLTJOhyIWCcKeA');"></div>
<div class="absolute top-2 right-2 bg-black/60 backdrop-blur-sm rounded p-1 text-white">
<span class="material-symbols-outlined text-[16px]">picture_as_pdf</span>
</div>
</div>
<div>
<p class="text-sm font-semibold text-slate-900 dark:text-white truncate">Nike Campaign Contract</p>
<p class="text-xs text-slate-500 dark:text-gray-400">2 min ago</p>
</div>
</div>
<!-- Card 2 -->
<div class="flex-shrink-0 w-40 flex flex-col gap-2 group cursor-pointer">
<div class="relative w-40 h-28 rounded-xl overflow-hidden bg-surface-dark border border-white/5 shadow-md">
<div class="absolute inset-0 bg-cover bg-center opacity-80 group-hover:opacity-100 transition-opacity duration-300" data-alt="Abstract gradient mesh in purple and blue tones" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuBAc-kb2NCQNFqs0WyO9yf619gDkL7estrcyan7TKSdlfHm8rMvL13Pd_Le4auAi3cT8iI8RhFZwiWtqhbl0LaCph4TmVNZ-X3iPa2_eUn3NV3YV2yKi_sLitBaldBQ-biD78YwQ4Z4ruEnJiHom7-3pQmMNDlfgMHkVPBlJ48nH4tkIqt9Uj87SJdYzOPI_dmiibTBJRclimSEmpej6gBIqVhcgHi27BjP74TKEQDGv8qXZ0oiYRhAVf0x3LFYNoGZEDS9So09TP8');"></div>
<div class="absolute top-2 right-2 bg-black/60 backdrop-blur-sm rounded p-1 text-white">
<span class="material-symbols-outlined text-[16px]">image</span>
</div>
</div>
<div>
<p class="text-sm font-semibold text-slate-900 dark:text-white truncate">Media Kit v2.4</p>
<p class="text-xs text-slate-500 dark:text-gray-400">1h ago</p>
</div>
</div>
<!-- Card 3 -->
<div class="flex-shrink-0 w-40 flex flex-col gap-2 group cursor-pointer">
<div class="relative w-40 h-28 rounded-xl overflow-hidden bg-surface-dark border border-white/5 shadow-md">
<div class="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center group-hover:from-gray-700 group-hover:to-gray-800 transition-colors" data-alt="Dark abstract geometric pattern representing finance">
<span class="material-symbols-outlined text-gray-500 text-4xl">receipt_long</span>
</div>
<div class="absolute top-2 right-2 bg-black/60 backdrop-blur-sm rounded p-1 text-white">
<span class="material-symbols-outlined text-[16px]">description</span>
</div>
</div>
<div>
<p class="text-sm font-semibold text-slate-900 dark:text-white truncate">Q3 Invoice - Sephora</p>
<p class="text-xs text-slate-500 dark:text-gray-400">Yesterday</p>
</div>
</div>
</div>
</section>
<!-- Folders Grid -->
<section class="mt-4 px-4">
<h3 class="text-lg font-bold text-slate-900 dark:text-white mb-3">Folders</h3>
<div class="grid grid-cols-2 gap-3">
<div class="bg-white dark:bg-surface-dark p-4 rounded-xl border border-gray-200 dark:border-white/5 flex flex-col gap-3 active:scale-[0.98] transition-transform cursor-pointer">
<div class="flex justify-between items-start">
<div class="p-2 bg-blue-500/20 rounded-lg text-primary">
<span class="material-symbols-outlined">folder</span>
</div>
<span class="material-symbols-outlined text-gray-400 text-sm">more_vert</span>
</div>
<div>
<p class="font-semibold text-sm text-slate-900 dark:text-white">Legal &amp; Contracts</p>
<p class="text-xs text-slate-500 dark:text-gray-400 mt-1">12 files</p>
</div>
</div>
<div class="bg-white dark:bg-surface-dark p-4 rounded-xl border border-gray-200 dark:border-white/5 flex flex-col gap-3 active:scale-[0.98] transition-transform cursor-pointer">
<div class="flex justify-between items-start">
<div class="p-2 bg-purple-500/20 rounded-lg text-purple-400">
<span class="material-symbols-outlined">folder</span>
</div>
<span class="material-symbols-outlined text-gray-400 text-sm">more_vert</span>
</div>
<div>
<p class="font-semibold text-sm text-slate-900 dark:text-white">Invoices &amp; Earnings</p>
<p class="text-xs text-slate-500 dark:text-gray-400 mt-1">8 files</p>
</div>
</div>
</div>
</section>
<!-- All Documents List -->
<section class="mt-8 px-4">
<h3 class="text-lg font-bold text-slate-900 dark:text-white mb-4">All Documents</h3>
<div class="flex flex-col space-y-2">
<!-- List Item 1 -->
<div class="group flex items-center gap-4 bg-white dark:bg-surface-dark p-3 rounded-xl border border-gray-200 dark:border-white/5 hover:border-primary/50 transition-colors cursor-pointer">
<div class="flex-shrink-0 w-12 h-12 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500">
<span class="material-symbols-outlined">picture_as_pdf</span>
</div>
<div class="flex-1 min-w-0">
<p class="text-sm font-semibold text-slate-900 dark:text-white truncate">Summer Campaign Agreement</p>
<div class="flex items-center gap-2 mt-0.5">
<p class="text-xs text-slate-500 dark:text-gray-400">2.4 MB</p>
<span class="w-1 h-1 rounded-full bg-slate-600 dark:bg-gray-600"></span>
<p class="text-xs text-slate-500 dark:text-gray-400">Oct 24, 2023</p>
<span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-green-500/20 text-green-400 ml-auto mr-1">SIGNED</span>
</div>
</div>
<button class="p-2 text-gray-400 hover:text-white transition-colors">
<span class="material-symbols-outlined">more_vert</span>
</button>
</div>
<!-- List Item 2 -->
<div class="group flex items-center gap-4 bg-white dark:bg-surface-dark p-3 rounded-xl border border-gray-200 dark:border-white/5 hover:border-primary/50 transition-colors cursor-pointer">
<div class="flex-shrink-0 w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
<span class="material-symbols-outlined">image</span>
</div>
<div class="flex-1 min-w-0">
<p class="text-sm font-semibold text-slate-900 dark:text-white truncate">Updated Media Kit 2024</p>
<div class="flex items-center gap-2 mt-0.5">
<p class="text-xs text-slate-500 dark:text-gray-400">5.1 MB</p>
<span class="w-1 h-1 rounded-full bg-slate-600 dark:bg-gray-600"></span>
<p class="text-xs text-slate-500 dark:text-gray-400">Oct 20, 2023</p>
</div>
</div>
<button class="p-2 text-gray-400 hover:text-white transition-colors">
<span class="material-symbols-outlined">more_vert</span>
</button>
</div>
<!-- List Item 3 -->
<div class="group flex items-center gap-4 bg-white dark:bg-surface-dark p-3 rounded-xl border border-gray-200 dark:border-white/5 hover:border-primary/50 transition-colors cursor-pointer">
<div class="flex-shrink-0 w-12 h-12 rounded-lg bg-gray-500/10 flex items-center justify-center text-gray-400">
<span class="material-symbols-outlined">description</span>
</div>
<div class="flex-1 min-w-0">
<p class="text-sm font-semibold text-slate-900 dark:text-white truncate">Brand Guidelines - Sony</p>
<div class="flex items-center gap-2 mt-0.5">
<p class="text-xs text-slate-500 dark:text-gray-400">14.2 MB</p>
<span class="w-1 h-1 rounded-full bg-slate-600 dark:bg-gray-600"></span>
<p class="text-xs text-slate-500 dark:text-gray-400">Oct 18, 2023</p>
</div>
</div>
<button class="p-2 text-gray-400 hover:text-white transition-colors">
<span class="material-symbols-outlined">more_vert</span>
</button>
</div>
<!-- List Item 4 -->
<div class="group flex items-center gap-4 bg-white dark:bg-surface-dark p-3 rounded-xl border border-gray-200 dark:border-white/5 hover:border-primary/50 transition-colors cursor-pointer">
<div class="flex-shrink-0 w-12 h-12 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500">
<span class="material-symbols-outlined">picture_as_pdf</span>
</div>
<div class="flex-1 min-w-0">
<p class="text-sm font-semibold text-slate-900 dark:text-white truncate">NDA - Project Alpha</p>
<div class="flex items-center gap-2 mt-0.5">
<p class="text-xs text-slate-500 dark:text-gray-400">1.1 MB</p>
<span class="w-1 h-1 rounded-full bg-slate-600 dark:bg-gray-600"></span>
<p class="text-xs text-slate-500 dark:text-gray-400">Sep 29, 2023</p>
<span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-yellow-500/20 text-yellow-400 ml-auto mr-1">PENDING</span>
</div>
</div>
<button class="p-2 text-gray-400 hover:text-white transition-colors">
<span class="material-symbols-outlined">more_vert</span>
</button>
</div>
</div>
</section>
<!-- Storage Meter Footer -->
<div class="px-8 pt-10 pb-6 text-center">
<div class="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-1.5 mb-3 overflow-hidden">
<div class="bg-primary h-1.5 rounded-full" style="width: 24%"></div>
</div>
<p class="text-xs text-slate-500 dark:text-gray-500 font-medium">1.2GB of 5GB used</p>
<div class="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20">
<span class="material-symbols-outlined text-green-500 text-[14px]">lock</span>
<span class="text-[10px] uppercase font-bold text-green-500 tracking-wide">Encrypted &amp; Secure</span>
</div>
</div>
</main>
<!-- Floating Action Button -->
<button class="fixed bottom-6 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-lg shadow-primary/40 flex items-center justify-center hover:bg-blue-600 active:scale-90 transition-all z-30 group">
<span class="material-symbols-outlined text-3xl group-hover:rotate-90 transition-transform duration-300">add</span>
</button>
<!-- Optional: Gradient overlay at bottom to smooth scroll -->
<div class="fixed bottom-0 left-0 w-full h-8 bg-gradient-to-t from-background-light dark:from-background-dark to-transparent pointer-events-none z-10"></div>
</body></html>
```


---

## SCREEN: new_message__compose

Path: `screens/new_message__compose/index.html`

```html
<!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>New Message: Compose - CreatorX</title>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#1337ec",
                        "background-light": "#f6f6f8",
                        "background-dark": "#050505", // Deep black for premium feel
                        "surface-dark": "#121212",
                        "border-dark": "#27272a"
                    },
                    fontFamily: {
                        "display": ["Plus Jakarta Sans", "sans-serif"]
                    },
                    borderRadius: {"DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "full": "9999px"},
                },
            },
        }
    </script>
<style>
        /* Custom scrollbar hiding for a clean mobile look */
        .no-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display antialiased h-screen overflow-hidden flex flex-col">
<!-- Header -->
<header class="flex items-center justify-between px-4 py-3 bg-white/5 dark:bg-surface-dark border-b border-gray-200 dark:border-border-dark shrink-0 backdrop-blur-md sticky top-0 z-50">
<button class="text-base font-medium text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-white transition-colors">
            Cancel
        </button>
<h2 class="text-lg font-bold leading-tight tracking-[-0.015em]">New Message</h2>
<div class="w-[50px]"></div> <!-- Spacer to balance Cancel button -->
</header>
<!-- Recipient Selection -->
<div class="px-4 py-3 border-b border-gray-200 dark:border-border-dark shrink-0">
<div class="flex items-center gap-3">
<span class="text-gray-500 dark:text-gray-400 text-base font-medium">To:</span>
<!-- Recipient Chip -->
<div class="flex items-center gap-2 bg-primary/10 dark:bg-[#1a1d2d] pl-1 pr-3 py-1 rounded-full border border-primary/20">
<div class="w-6 h-6 rounded-full bg-cover bg-center shrink-0" data-alt="Nike brand logo icon" style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuCywxxmfNOJbPA-Wk97G703x4VX0lHxuV1P8JVj6VketOMGbLwfdImRJ19GavqLUBajKxDbIo9xiqLCbvXqgy079wYHlO1V3MKK_k9nFQn-fh-ckEjcXGIsaoTotOByoiDU7CLz2vrym9n6kP2qcw67QKNj52fHHulTWs9ONFrFWokom8-UcmR8o0Iq61iJ4gwwub1z4rIt98hCSImgjvenxpkEPZ3hz49NxhuR3MhQOtlpzIqb3mcqPYP57APWI5l7zcu1eLiQ-h0");'>
</div>
<span class="text-sm font-semibold text-primary dark:text-white">Nike</span>
<button class="flex items-center justify-center text-primary/60 hover:text-primary dark:text-gray-400 dark:hover:text-white transition-colors ml-1">
<span class="material-symbols-outlined text-lg" style="font-size: 16px;">close</span>
</button>
</div>
</div>
</div>
<!-- Main Composition Area -->
<main class="flex-1 flex flex-col relative w-full max-w-md mx-auto h-full">
<!-- Text Input -->
<div class="flex-1 w-full p-4">
<textarea autofocus="" class="w-full h-full bg-transparent text-lg text-slate-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 border-none focus:ring-0 resize-none p-0 leading-relaxed font-normal caret-primary" placeholder="Start a conversation about a campaign..."></textarea>
</div>
<!-- Composer / Keyboard Accessory View -->
<!-- Simulating the toolbar that sits above keyboard on mobile -->
<div class="w-full bg-white dark:bg-surface-dark border-t border-gray-200 dark:border-border-dark p-3 pb-8 shrink-0">
<div class="flex items-end justify-between gap-4">
<!-- Utilities -->
<div class="flex items-center gap-1">
<button class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 transition-colors group">
<span class="material-symbols-outlined group-hover:text-primary transition-colors">add_photo_alternate</span>
</button>
<button class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 transition-colors group">
<span class="material-symbols-outlined group-hover:text-primary transition-colors">attach_file</span>
</button>
<button class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 transition-colors group relative">
<span class="material-symbols-outlined group-hover:text-primary transition-colors">bolt</span>
<!-- Pro feature indicator dot -->
<span class="absolute top-2 right-2 w-1.5 h-1.5 bg-primary rounded-full ring-2 ring-white dark:ring-surface-dark"></span>
</button>
</div>
<!-- Send Button -->
<button class="flex items-center gap-2 bg-primary hover:bg-blue-700 text-white pl-4 pr-5 py-2.5 rounded-full font-medium transition-all shadow-lg shadow-primary/25 active:scale-95">
<span class="text-sm">Send</span>
<span class="material-symbols-outlined text-[18px]">send</span>
</button>
</div>
<!-- Simulated Keyboard Spacer for Visualizing layout (iOS Home Indicator area) -->
<div class="h-1 w-full"></div>
</div>
<!-- Simulated Keyboard Area (Visual placeholder for design context) -->
<div class="w-full bg-[#d1d5db] dark:bg-[#282828] hidden sm:block h-[300px] relative overflow-hidden">
<!-- Abstract representation of a keyboard -->
<div class="absolute inset-0 flex flex-col gap-1.5 p-1.5 opacity-50">
<div class="h-10 w-full flex gap-1.5">
<div class="bg-white dark:bg-white/10 rounded h-full flex-1"></div>
<div class="bg-white dark:bg-white/10 rounded h-full flex-1"></div>
<div class="bg-white dark:bg-white/10 rounded h-full flex-1"></div>
<div class="bg-white dark:bg-white/10 rounded h-full flex-1"></div>
<div class="bg-white dark:bg-white/10 rounded h-full flex-1"></div>
<div class="bg-white dark:bg-white/10 rounded h-full flex-1"></div>
<div class="bg-white dark:bg-white/10 rounded h-full flex-1"></div>
<div class="bg-white dark:bg-white/10 rounded h-full flex-1"></div>
<div class="bg-white dark:bg-white/10 rounded h-full flex-1"></div>
<div class="bg-white dark:bg-white/10 rounded h-full flex-1"></div>
</div>
<div class="h-10 w-full flex gap-1.5 px-4">
<div class="bg-white dark:bg-white/10 rounded h-full flex-1"></div>
<div class="bg-white dark:bg-white/10 rounded h-full flex-1"></div>
<div class="bg-white dark:bg-white/10 rounded h-full flex-1"></div>
<div class="bg-white dark:bg-white/10 rounded h-full flex-1"></div>
<div class="bg-white dark:bg-white/10 rounded h-full flex-1"></div>
<div class="bg-white dark:bg-white/10 rounded h-full flex-1"></div>
<div class="bg-white dark:bg-white/10 rounded h-full flex-1"></div>
<div class="bg-white dark:bg-white/10 rounded h-full flex-1"></div>
<div class="bg-white dark:bg-white/10 rounded h-full flex-1"></div>
</div>
<div class="h-10 w-full flex gap-1.5 px-10">
<div class="bg-gray-400 dark:bg-gray-600 rounded h-full w-10"></div>
<div class="bg-white dark:bg-white/10 rounded h-full flex-1"></div>
<div class="bg-white dark:bg-white/10 rounded h-full flex-1"></div>
<div class="bg-white dark:bg-white/10 rounded h-full flex-1"></div>
<div class="bg-white dark:bg-white/10 rounded h-full flex-1"></div>
<div class="bg-white dark:bg-white/10 rounded h-full flex-1"></div>
<div class="bg-white dark:bg-white/10 rounded h-full flex-1"></div>
<div class="bg-white dark:bg-white/10 rounded h-full flex-1"></div>
<div class="bg-gray-400 dark:bg-gray-600 rounded h-full w-10"></div>
</div>
<div class="h-10 w-full flex gap-1.5 px-1 pt-1">
<div class="bg-gray-400 dark:bg-gray-600 rounded h-full w-24"></div>
<div class="bg-white dark:bg-white/10 rounded h-full flex-1"></div>
<div class="bg-gray-400 dark:bg-gray-600 rounded h-full w-24"></div>
</div>
</div>
<div class="absolute inset-0 flex items-center justify-center pointer-events-none">
<span class="text-sm font-medium text-gray-500 dark:text-gray-400 bg-white/80 dark:bg-black/80 px-3 py-1 rounded-full backdrop-blur-sm">Keyboard Area</span>
</div>
</div>
</main>
</body></html>
```


---

## SCREEN: new_message__select_brand

Path: `screens/new_message__select_brand/index.html`

```html
<!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>CreatorX - New Message</title>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#1337ec",
                        "background-light": "#f6f6f8",
                        "background-dark": "#101322",
                        "surface-dark": "#1c1f2e",
                    },
                    fontFamily: {
                        "display": ["Plus Jakarta Sans", "sans-serif"]
                    },
                    borderRadius: { "DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "full": "9999px" },
                },
            },
        }
    </script>
<style>
        /* Custom scrollbar for webkit */
        ::-webkit-scrollbar {
            width: 0px;
            background: transparent;
        }
        /* Hide scrollbar for standard */
        body {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-white overflow-hidden h-screen w-full flex flex-col items-center justify-center">
<!-- Mobile Container -->
<div class="relative flex flex-col h-full w-full max-w-md mx-auto bg-background-light dark:bg-background-dark overflow-hidden shadow-2xl border-x border-gray-200 dark:border-gray-800">
<!-- Header -->
<header class="flex items-center justify-between px-4 pt-12 pb-4 bg-background-light dark:bg-background-dark z-10 sticky top-0">
<h2 class="text-xl font-bold leading-tight tracking-[-0.015em]">New Message</h2>
<button class="flex items-center justify-center size-10 rounded-full bg-gray-200 dark:bg-surface-dark hover:bg-gray-300 dark:hover:bg-gray-800 transition-colors">
<span class="material-symbols-outlined text-gray-900 dark:text-white text-xl">close</span>
</button>
</header>
<!-- Search Bar -->
<div class="px-4 pb-2">
<div class="relative flex items-center w-full h-12 rounded-xl bg-gray-200 dark:bg-surface-dark overflow-hidden group focus-within:ring-1 focus-within:ring-primary transition-all duration-300">
<div class="grid place-items-center h-full w-12 text-gray-500">
<span class="material-symbols-outlined">search</span>
</div>
<input class="peer h-full w-full outline-none text-sm text-gray-700 dark:text-gray-200 pr-2 bg-transparent border-none placeholder-gray-500 font-medium" id="search" placeholder="Search brands..." type="text"/>
</div>
</div>
<!-- Scrollable Content -->
<div class="flex-1 overflow-y-auto pb-6">
<!-- Section: Recent -->
<div class="pt-6">
<h3 class="px-4 text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Recent</h3>
<!-- List Item -->
<button class="w-full text-left group">
<div class="flex items-center gap-4 px-4 py-3 hover:bg-gray-200 dark:hover:bg-surface-dark transition-colors">
<div class="relative shrink-0">
<div class="bg-center bg-no-repeat bg-cover rounded-full h-12 w-12 border border-gray-200 dark:border-gray-700" data-alt="Logo for Nike showing the swoosh on black background" style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuAZrpomo2BGtnQB3YzFSFvD3nMrPDC1im3Y9IDg4tlHugN9uKSF_GoFo1TQBmyJakliOHLFhG0lA6dAmGupuDVsqcXmCCyWV3TkBaAYLp6MQa-0JKtdhLh6A8TTxt8sjo0EN85lbHa3mWdh9JbFtPWFOAkXLgW45LMLBQo7ZnBDJttAqyFWS3A4htGLIkXUSNyjB6gAEf_-kTQg86fYPeajj9PFHnGFjsmLw-AP0HB8WzsCHNmqLXxwtIzgFaJRyzywppG29VLyKmg");'>
</div>
<!-- Online Indicator -->
<span class="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 ring-2 ring-white dark:ring-background-dark"></span>
</div>
<div class="flex flex-col flex-1 min-w-0">
<div class="flex justify-between items-baseline">
<p class="text-base font-semibold text-gray-900 dark:text-white truncate">Nike</p>
<span class="text-xs text-gray-500">2m ago</span>
</div>
<p class="text-sm text-gray-500 truncate dark:text-gray-400">Summer Run Campaign</p>
</div>
<span class="material-symbols-outlined text-gray-400 dark:text-gray-600 group-hover:text-primary transition-colors">chevron_right</span>
</div>
</button>
<!-- List Item -->
<button class="w-full text-left group">
<div class="flex items-center gap-4 px-4 py-3 hover:bg-gray-200 dark:hover:bg-surface-dark transition-colors">
<div class="relative shrink-0">
<div class="bg-center bg-no-repeat bg-cover rounded-full h-12 w-12 border border-gray-200 dark:border-gray-700" data-alt="Logo for Adidas showing 3 stripes" style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuCM5d4akIbaai4j3IneT7UCxWrWRRUwvlBlKgBiU2AOZMtCaeiXYgdzv3Sxu2Vnsp9nRYKW6SddPfkg6DyUWx2DiHA0pesgtB9nsfPPlH-tWnYSmqrVuqPjByfG5wiGB4u_ChtqHYBJLvloSvXTYOyunfDOw-qF68Crc69GyjDjgHfGRtnD13R9QgMzdbyJBENV__hDOOBLiYDID_mEGBYNl-WuNb_gBSZIQDun4Zgc4swcOaf15dYFyOH5T-2lxfbUj6YKE7aMlf0");'>
</div>
</div>
<div class="flex flex-col flex-1 min-w-0">
<div class="flex justify-between items-baseline">
<p class="text-base font-semibold text-gray-900 dark:text-white truncate">Adidas Originals</p>
<span class="text-xs text-gray-500">1h ago</span>
</div>
<p class="text-sm text-gray-500 truncate dark:text-gray-400">Sent an offer for Fall '24</p>
</div>
<span class="material-symbols-outlined text-gray-400 dark:text-gray-600 group-hover:text-primary transition-colors">chevron_right</span>
</div>
</button>
</div>
<!-- Section: Active Collaborations -->
<div class="pt-6">
<h3 class="px-4 text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Active Collaborations</h3>
<!-- List Item -->
<button class="w-full text-left group">
<div class="flex items-center gap-4 px-4 py-3 hover:bg-gray-200 dark:hover:bg-surface-dark transition-colors">
<div class="relative shrink-0">
<div class="bg-center bg-no-repeat bg-cover rounded-full h-12 w-12 border border-gray-200 dark:border-gray-700" data-alt="Abstract colorful makeup palette texture for Sephora" style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuAGWHRtr_c3d8T1thdIAxcAEszE-7SGFjEkJIKFgNHXa0hYHG-ckAQRFurc7PTeU6gUYPckIsBfh9x8BREJRSl1y-OPCeqlAEwMjjxXWdAciKgAHVNNQokXsJZN8YKwvls8C5vQgjw3cbqKO99pB_VEcnMZeP9mKF6yGNNt8OTYX31c5qii2QVlf8cUiMi5FPIRoizVgFGcdOrrnmJ-Td7-zX2pLi9E2a9idqS-HhDfLnveyQgstmibHZBTUYOkemfkIFVSgDwy5Eg");'>
</div>
<span class="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 ring-2 ring-white dark:ring-background-dark"></span>
</div>
<div class="flex flex-col flex-1 min-w-0">
<p class="text-base font-semibold text-gray-900 dark:text-white truncate">Sephora</p>
<p class="text-sm text-primary truncate font-medium">Draft Due in 2 days</p>
</div>
<span class="material-symbols-outlined text-gray-400 dark:text-gray-600 group-hover:text-primary transition-colors">chevron_right</span>
</div>
</button>
<!-- List Item -->
<button class="w-full text-left group">
<div class="flex items-center gap-4 px-4 py-3 hover:bg-gray-200 dark:hover:bg-surface-dark transition-colors">
<div class="relative shrink-0">
<div class="bg-center bg-no-repeat bg-cover rounded-full h-12 w-12 border border-gray-200 dark:border-gray-700" data-alt="Modern tech gadget close up for GoPro" style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuD8Kz2OICACjhKPN_jKVOCmpdidbUm2tbal946rBScMr8YAp5ejzu2_YzXXvJGZM77BgDJ7jBbTJg9aGT-aernZ4QrB4evQpbD8SFlUHKt2Y_avZgoUxnSG20mMAShuSkLEwmikXL508Ecld5X0Sdtd1f5_CGYSJz5c4oT9l9zog9kkXes2oWA-zjQ-LTFS_4XaXq1ttMmK5eaTQh8FrlNbhLxw5C8b1WD1qmuMec6jHoIFWLVVidSyw0No8Ex7ETZmrY3HErEXn3c");'>
</div>
</div>
<div class="flex flex-col flex-1 min-w-0">
<p class="text-base font-semibold text-gray-900 dark:text-white truncate">GoPro</p>
<p class="text-sm text-gray-500 truncate dark:text-gray-400">Content Approval Pending</p>
</div>
<span class="material-symbols-outlined text-gray-400 dark:text-gray-600 group-hover:text-primary transition-colors">chevron_right</span>
</div>
</button>
</div>
<!-- Section: Suggested -->
<div class="pt-6">
<h3 class="px-4 text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Suggested</h3>
<!-- List Item -->
<button class="w-full text-left group">
<div class="flex items-center gap-4 px-4 py-3 hover:bg-gray-200 dark:hover:bg-surface-dark transition-colors opacity-70 hover:opacity-100">
<div class="relative shrink-0">
<div class="bg-center bg-no-repeat bg-cover rounded-full h-12 w-12 border border-gray-200 dark:border-gray-700 grayscale" data-alt="Minimalist coffee cup art for Starbucks" style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuC_fjqkfKzwHZs_g7uzQaHwuaLlRBg0ZRzNfT__tyyk-178ubk9nJQLgTIUPMvi2UKMWc3u5bh1_BxoMZob3cUizXBElW8Ts2e3KsWiBgItYZ6NO0wnmauzMv4bPMEx7ukGrTyktNnIclkXU_I4NwV-O24OudUIli69SdXv12THj8WAmLdJLJ90_sYTTlW-a21kSDcNzlhBX7-Zf8_pLDg_oSGMBWfTTazY6qmj_6op1-1zVffX8VRGVGQq1PnslVsVxHWDRudM4K0");'>
</div>
</div>
<div class="flex flex-col flex-1 min-w-0">
<p class="text-base font-semibold text-gray-900 dark:text-white truncate">Starbucks</p>
<p class="text-sm text-gray-500 truncate dark:text-gray-400">Apply to 'Fall Seasonal'</p>
</div>
<div class="bg-primary/10 text-primary rounded-full p-1.5 flex items-center justify-center">
<span class="material-symbols-outlined text-lg">add</span>
</div>
</div>
</button>
<!-- List Item -->
<button class="w-full text-left group">
<div class="flex items-center gap-4 px-4 py-3 hover:bg-gray-200 dark:hover:bg-surface-dark transition-colors opacity-70 hover:opacity-100">
<div class="relative shrink-0">
<div class="bg-center bg-no-repeat bg-cover rounded-full h-12 w-12 border border-gray-200 dark:border-gray-700 grayscale" data-alt="Close up of a premium watch face for Rolex" style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuBkC-JuhMRNCmaxdorctplY-j5MMZ_daa40GATLcvX_fIMOGvOrJdQp8e6e8kz7FVMCwZv-QIDTaEtmR0xK2tnenQZR7NsCFeudZwtLXgNbluyK7mLsewl-ME0oH3HDjss7HQt2R18FfUuypLHqkxkAZqgzByVShKJhFubFDKQXv_g5wj07w5pHfc-78tSxFLyJG3b7U7obVTLZlo2FpTroqt28kd_FY7WH2K705KGu2Mqv9s7QxL5Dd0gjvn2EpdO8IwCKtrBDbo8");'>
</div>
</div>
<div class="flex flex-col flex-1 min-w-0">
<p class="text-base font-semibold text-gray-900 dark:text-white truncate">Rolex</p>
<p class="text-sm text-gray-500 truncate dark:text-gray-400">Invitation to apply</p>
</div>
<div class="bg-primary/10 text-primary rounded-full p-1.5 flex items-center justify-center">
<span class="material-symbols-outlined text-lg">add</span>
</div>
</div>
</button>
</div>
<div class="h-10"></div> <!-- Spacer for bottom safety area -->
</div>
<!-- Optional: Bottom Gradient Fade for infinite scroll feel -->
<div class="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-background-light dark:from-background-dark to-transparent pointer-events-none"></div>
</div>
</body></html>
```


---

## SCREEN: onboarding__discover_campaigns

Path: `screens/onboarding__discover_campaigns/index.html`

```html
<!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>CreatorX Onboarding</title>
<!-- Fonts -->
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<!-- Tailwind CSS -->
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#1337ec",
                        "background-light": "#f6f6f8",
                        "background-dark": "#101322",
                    },
                    fontFamily: {
                        "display": ["Plus Jakarta Sans", "sans-serif"]
                    },
                    borderRadius: {"DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "full": "9999px"},
                },
            },
        }
    </script>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-white selection:bg-primary selection:text-white">
<div class="relative flex h-full min-h-screen w-full flex-col overflow-hidden">
<!-- Background Gradient/Glow Effect -->
<div class="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-primary/20 blur-[100px] pointer-events-none"></div>
<!-- Top Bar -->
<div class="relative z-10 flex items-center p-6 pt-12 justify-end">
<button class="group flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold text-slate-500 dark:text-slate-400 transition-colors hover:bg-slate-200 dark:hover:bg-white/10">
                Skip
            </button>
</div>
<!-- Main Content Area -->
<div class="relative z-10 flex flex-1 flex-col justify-end px-6 pb-8">
<!-- Hero Visual -->
<div class="flex-1 flex flex-col items-center justify-center w-full mb-8">
<div class="relative w-full max-w-sm aspect-[4/5] max-h-[50vh]">
<!-- Decorative elements representing card stack -->
<div class="absolute top-4 left-4 right-4 bottom-0 bg-white/5 border border-white/10 rounded-2xl transform rotate-3 opacity-60"></div>
<div class="absolute top-2 left-2 right-2 bottom-2 bg-white/10 border border-white/10 rounded-2xl transform -rotate-2 opacity-80"></div>
<!-- Main Card Image -->
<div class="absolute inset-0 bg-center bg-no-repeat bg-cover rounded-2xl shadow-2xl border border-white/10 overflow-hidden" data-alt="Abstract 3D shapes representing modern digital marketing and premium opportunities" style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuAP_XM7Zk5UPHZhAxi2eYwj1lARft3ON9vcIBbwKbXwwcu_XXMrAKQBf8aT2k3GhwLi_Cm8JXrJqMKBG-MvaUMlQFLqiYt1H6vEELTBHrLfC5WikN4qarJImBF4e0TCMnnFEKRG6iorpytoZpUDquavDI-sEP6TonnxowkeSDvdNPdc-iSa2_Yc782BF3QVwEMus4IgVaoQbsyVQxGx_fYvyBHHIInjVdK4sZYwHdvJEPecJlnasLcitjszUQIZhgn8qucmyhc7oMQ");'>
<!-- Overlay Gradient for text readability if image is busy, though mostly aesthetic here -->
<div class="absolute inset-0 bg-gradient-to-t from-background-dark/80 via-transparent to-transparent"></div>
<!-- Mock UI Element inside the card -->
<div class="absolute bottom-6 left-6 right-6">
<div class="flex items-center gap-3 mb-2">
<div class="h-8 w-8 rounded-full bg-white flex items-center justify-center">
<span class="material-symbols-outlined text-black text-sm">verified</span>
</div>
<span class="text-white font-bold text-lg">Brand Deal</span>
</div>
<div class="h-1.5 w-2/3 bg-white/30 rounded-full mb-2"></div>
<div class="h-1.5 w-1/2 bg-white/30 rounded-full"></div>
</div>
</div>
</div>
</div>
<!-- Text Content -->
<div class="mb-8 space-y-4">
<h1 class="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                    Find Your <br/>
<span class="text-primary">Perfect Match</span>
</h1>
<p class="text-lg text-slate-600 dark:text-slate-400 font-medium leading-relaxed max-w-sm">
                    Access a curated feed of premium campaigns from world-class brands, filtered just for you.
                </p>
</div>
<!-- Footer Navigation -->
<div class="flex items-center justify-between mt-auto pt-4">
<!-- Pagination Indicators -->
<div class="flex items-center gap-2">
<!-- Active Dot (Pill) -->
<div class="h-2 w-8 rounded-full bg-primary transition-all duration-300"></div>
<!-- Inactive Dots -->
<div class="h-2 w-2 rounded-full bg-slate-300 dark:bg-white/20 transition-all duration-300"></div>
<div class="h-2 w-2 rounded-full bg-slate-300 dark:bg-white/20 transition-all duration-300"></div>
</div>
<!-- Next Button -->
<button class="flex items-center justify-center h-14 w-14 rounded-full bg-primary text-white shadow-lg shadow-primary/30 transition-transform active:scale-95 hover:bg-primary/90">
<span class="material-symbols-outlined text-[28px]">arrow_forward</span>
</button>
</div>
</div>
</div>
</body></html>
```


---

## SCREEN: onboarding__earnings___chat

Path: `screens/onboarding__earnings___chat/index.html`

```html
<!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>CreatorX Onboarding</title>
<!-- Google Fonts -->
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&amp;display=swap" rel="stylesheet"/>
<!-- Material Symbols -->
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<!-- Tailwind CSS -->
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<!-- Tailwind Configuration -->
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#1337ec",
                        "background-light": "#f6f6f8",
                        "background-dark": "#101322",
                    },
                    fontFamily: {
                        "display": ["Plus Jakarta Sans", "sans-serif"]
                    },
                    borderRadius: {
                        "DEFAULT": "0.25rem",
                        "lg": "0.5rem",
                        "xl": "0.75rem",
                        "2xl": "1rem",
                        "3xl": "1.5rem",
                        "full": "9999px"
                    },
                },
            },
        }
    </script>
<style>
        /* Custom scrollbar hide for cleaner UI */
        .no-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-background-light dark:bg-background-dark font-display antialiased selection:bg-primary/30 selection:text-primary">
<!-- Main Container -->
<div class="relative flex h-screen w-full flex-col overflow-hidden max-w-md mx-auto shadow-2xl bg-background-light dark:bg-background-dark">
<!-- Top Navigation / Brand (Subtle) -->
<div class="absolute top-0 left-0 w-full z-20 px-6 pt-12 pb-4 flex justify-between items-center">
<!-- Logo Mark -->
<div class="flex items-center gap-2 opacity-80">
<div class="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center backdrop-blur-sm">
<span class="material-symbols-outlined text-primary" style="font-size: 20px;">auto_awesome</span>
</div>
<span class="text-sm font-bold tracking-widest uppercase text-slate-900 dark:text-white">CreatorX</span>
</div>
<!-- Skip button (optional, but good UX) -->
<button class="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-primary transition-colors">
                Skip
            </button>
</div>
<!-- Main Visual Area -->
<div class="relative flex-1 flex flex-col items-center justify-center w-full px-6 pt-10">
<!-- Background Glow Effect -->
<div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/30 rounded-full blur-[80px] pointer-events-none"></div>
<!-- Hero Image Component -->
<div class="@container w-full max-w-[320px]">
<div class="w-full aspect-[4/5] bg-center bg-no-repeat bg-contain flex flex-col justify-end transition-transform duration-700 hover:scale-105" data-alt="3D illustration of a floating revenue graph going up and a chat bubble icon" style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuC9-n8uK_vWkxZoixGqLnU1RDc91sCBwZYfcjr81rBeA0wfd3zACy_1FLX5hvuH5zgHqzkpYBwPgy9Dq0ajiSwRp5xB-JzdZIp0GmuTY7OzXHVLJb-xD3a_FS7GQYXGBL2tER4sSCwGK2fX4TevadIfttH5qrJBdCl3IUWVm1fOPEnyXjrYP2jDPBrOIX6iroqslbmqV_kv-vq1mX4OyZ2qO5FzbRuLelmshdZZtxvgoTANIPgKzmwgxxkt90U1Vz3Iatxuw-1PJt4");'>
</div>
</div>
</div>
<!-- Bottom Content Section -->
<div class="relative w-full z-10 flex flex-col pb-8 pt-4">
<!-- Text Content -->
<div class="px-6 text-center mb-8">
<!-- Headline -->
<h1 class="text-slate-900 dark:text-white tracking-tight text-3xl font-extrabold leading-tight mb-3">
                    Track Earnings <br class="hidden min-[380px]:block"/> &amp; Chat
                </h1>
<!-- Body Text -->
<p class="text-slate-500 dark:text-slate-400 text-base font-medium leading-relaxed max-w-[300px] mx-auto">
                    Monitor your campaign revenue in real-time and communicate directly with top brands.
                </p>
</div>
<!-- Controls Area -->
<div class="flex flex-col items-center gap-6 px-6 w-full">
<!-- Page Indicators -->
<div class="flex flex-row items-center justify-center gap-2.5">
<!-- Inactive Dot 1 -->
<div class="h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-700 transition-colors"></div>
<!-- Inactive Dot 2 -->
<div class="h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-700 transition-colors"></div>
<!-- Active Dot 3 (Elongated) -->
<div class="h-2 w-6 rounded-full bg-primary shadow-[0_0_10px_rgba(19,55,236,0.5)]"></div>
</div>
<!-- Primary Action Button -->
<button class="group relative flex w-full items-center justify-center overflow-hidden rounded-2xl bg-primary h-14 px-8 text-white shadow-lg shadow-primary/25 transition-all active:scale-[0.98] hover:shadow-primary/40 hover:bg-blue-600">
<span class="text-base font-bold tracking-wide">Get Started</span>
<span class="material-symbols-outlined ml-2 transition-transform group-hover:translate-x-1" style="font-size: 20px;">arrow_forward</span>
</button>
<!-- Footer Link -->
<button class="text-sm font-semibold text-slate-500 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 transition-colors pb-2">
                    Already have an account? Log In
                </button>
</div>
<!-- Safe Area Spacer for iOS Home Indicator -->
<div class="h-4 w-full"></div>
</div>
</div>
</body></html>
```


---

## SCREEN: onboarding__submit_deliverables

Path: `screens/onboarding__submit_deliverables/index.html`

```html
<!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>CreatorX Onboarding</title>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;700;800&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#1337ec",
                        "background-light": "#f6f6f8",
                        "background-dark": "#101322",
                    },
                    fontFamily: {
                        "display": ["Plus Jakarta Sans", "sans-serif"]
                    },
                    borderRadius: { "DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "full": "9999px" },
                },
            },
        }
    </script>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-background-light dark:bg-background-dark font-display text-[#111418] dark:text-white transition-colors duration-200">
<div class="relative flex h-full min-h-screen w-full flex-col justify-between overflow-hidden">
<!-- Top Navigation -->
<div class="flex items-center w-full p-6 pt-12 justify-end z-20">
<button class="text-slate-500 dark:text-slate-400 text-base font-bold leading-normal tracking-wide hover:text-primary transition-colors">
                Skip
            </button>
</div>
<!-- Main Content -->
<div class="flex flex-1 flex-col items-center justify-center w-full max-w-md mx-auto px-6">
<!-- Central Visual Area -->
<div class="relative w-full aspect-square max-h-[400px] mb-8 flex items-center justify-center">
<!-- Ambient Glow -->
<div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-primary/20 blur-[80px] rounded-full pointer-events-none"></div>
<!-- Illustration Container -->
<div class="relative z-10 w-full h-full rounded-3xl overflow-hidden shadow-2xl shadow-black/50 border border-white/5 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-[#1A1D2D] dark:to-[#101322]" data-alt="Abstract phone screen showing a checkmark and an upload progress bar glowing blue">
<!-- Placeholder for actual illustration content described in prompt -->
<div class="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1616469829941-c7200edec809?q=80&amp;w=1000&amp;auto=format&amp;fit=crop')] bg-cover bg-center opacity-90 mix-blend-overlay"></div>
<!-- Stylized UI Mockup inside image container -->
<div class="absolute inset-0 flex flex-col items-center justify-center p-8">
<div class="w-16 h-16 rounded-full bg-primary flex items-center justify-center mb-6 shadow-lg shadow-primary/40">
<span class="material-symbols-outlined text-white text-3xl">cloud_upload</span>
</div>
<div class="w-full h-2 bg-slate-300 dark:bg-slate-700 rounded-full overflow-hidden mb-2">
<div class="h-full bg-primary w-3/4 rounded-full"></div>
</div>
<p class="text-xs font-medium text-slate-500 dark:text-slate-400 mt-2">Uploading Deliverable...</p>
</div>
</div>
</div>
<!-- Typography -->
<div class="flex flex-col items-center text-center space-y-4 max-w-xs">
<h1 class="text-3xl font-extrabold leading-tight tracking-tight text-[#111418] dark:text-white">
                    Submit in Seconds
                </h1>
<p class="text-slate-500 dark:text-slate-400 text-base font-medium leading-relaxed">
                    Upload your content directly to brand campaigns. Track approvals and feedback in real-time.
                </p>
</div>
</div>
<!-- Footer / Controls -->
<div class="flex flex-col items-center w-full px-6 pb-12 pt-4 gap-8 z-20">
<!-- Pagination Indicators -->
<div class="flex flex-row items-center gap-3">
<div class="h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-700"></div>
<div class="h-2 w-6 rounded-full bg-primary transition-all duration-300"></div> <!-- Active -->
<div class="h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-700"></div>
</div>
<!-- Primary Action Button -->
<button class="w-full bg-primary hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-lg h-14 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/25">
                Next
                <span class="material-symbols-outlined text-[20px] font-bold">arrow_forward</span>
</button>
</div>
</div>
</body></html>
```


---

## SCREEN: refer_and_earn

Path: `screens/refer_and_earn/index.html`

```html
<!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>CreatorX - Refer &amp; Earn</title>
<!-- Fonts -->
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;700;800&amp;display=swap" rel="stylesheet"/>
<!-- Material Symbols -->
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<!-- Tailwind CSS -->
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#1337ec",
                        "background-light": "#f6f6f8",
                        "background-dark": "#050505", /* Deep black as requested */
                        "surface-dark": "#121212",    /* Slightly lighter for cards */
                        "surface-highlight": "#1E1E1E",
                        "text-secondary": "#9da1b9",
                    },
                    fontFamily: {
                        "display": ["Plus Jakarta Sans", "sans-serif"]
                    },
                    borderRadius: {
                        "DEFAULT": "0.25rem",
                        "lg": "0.5rem",
                        "xl": "0.75rem",
                        "2xl": "1rem",
                        "full": "9999px"
                    },
                },
            },
        }
    </script>
<style>
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        /* Hide scrollbar for clean UI */
        ::-webkit-scrollbar {
            width: 0px;
            background: transparent;
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display antialiased selection:bg-primary selection:text-white">
<div class="relative flex h-full min-h-screen w-full max-w-md mx-auto flex-col overflow-x-hidden border-x border-white/5">
<!-- Ambient Background Glow -->
<div class="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[400px] bg-primary/10 blur-[100px] rounded-full pointer-events-none z-0"></div>
<!-- TopAppBar -->
<div class="relative z-10 flex items-center p-4 pb-2 justify-between sticky top-0 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md">
<div class="flex size-10 shrink-0 items-center justify-center rounded-full active:bg-white/10 cursor-pointer">
<span class="material-symbols-outlined text-white">arrow_back</span>
</div>
<h2 class="text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">Refer &amp; Earn</h2>
<div class="flex w-12 items-center justify-end cursor-pointer">
<p class="text-text-secondary text-sm font-bold leading-normal tracking-[0.015em] shrink-0 hover:text-white transition-colors">Terms</p>
</div>
</div>
<!-- Main Scrollable Content -->
<div class="relative z-10 flex-1 flex flex-col gap-6 p-4">
<!-- Hero Section -->
<div class="flex flex-col items-center text-center gap-6 pt-2">
<!-- Illustration Placeholder -->
<div class="size-32 rounded-full bg-gradient-to-br from-surface-highlight to-black border border-white/10 flex items-center justify-center shadow-[0_0_30px_rgba(19,55,236,0.15)] relative overflow-hidden">
<div class="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&amp;w=2564&amp;auto=format&amp;fit=crop')] bg-cover opacity-60 mix-blend-overlay" data-alt="Abstract 3D blue and black shapes representing network"></div>
<span class="material-symbols-outlined text-primary text-5xl relative z-10">loyalty</span>
</div>
<div class="flex flex-col gap-2 max-w-[300px]">
<h1 class="text-white text-4xl font-extrabold leading-tight tracking-tight">
                        Get $50. Give $50.
                    </h1>
<p class="text-text-secondary text-sm font-medium leading-relaxed">
                        Invite fellow creators to CreatorX. You both get paid when they complete their first campaign.
                    </p>
</div>
</div>
<!-- Referral Card -->
<div class="flex flex-col gap-4">
<div class="relative flex flex-col gap-3 rounded-2xl bg-surface-dark border border-white/5 p-5 shadow-lg">
<div class="flex items-center justify-between mb-1">
<span class="text-xs font-bold text-primary uppercase tracking-wider">Your Referral Code</span>
<span class="material-symbols-outlined text-text-secondary text-lg">qr_code_2</span>
</div>
<div class="flex items-center justify-between gap-3 bg-black/50 rounded-xl p-3 border border-white/10 border-dashed">
<p class="text-white text-xl font-mono font-bold tracking-wider select-all">CREATOR-X-2024</p>
<button class="flex items-center justify-center size-10 rounded-lg bg-white/5 hover:bg-white/10 text-primary transition-colors">
<span class="material-symbols-outlined text-[20px]">content_copy</span>
</button>
</div>
</div>
<button class="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl h-14 px-5 bg-primary hover:bg-blue-600 active:scale-[0.98] transition-all text-white shadow-[0_0_20px_rgba(19,55,236,0.4)]">
<span class="material-symbols-outlined">ios_share</span>
<span class="text-base font-bold tracking-wide">Share Referral Link</span>
</button>
</div>
<!-- Stats Section -->
<div class="grid grid-cols-3 gap-3">
<div class="flex flex-col items-center justify-center gap-1 rounded-2xl p-4 bg-surface-dark border border-white/5">
<p class="text-text-secondary text-xs font-semibold uppercase">Earned</p>
<p class="text-white text-xl font-bold">$150</p>
</div>
<div class="flex flex-col items-center justify-center gap-1 rounded-2xl p-4 bg-surface-dark border border-white/5">
<p class="text-text-secondary text-xs font-semibold uppercase">Sent</p>
<p class="text-white text-xl font-bold">12</p>
</div>
<div class="flex flex-col items-center justify-center gap-1 rounded-2xl p-4 bg-surface-dark border border-white/5">
<p class="text-text-secondary text-xs font-semibold uppercase">Pending</p>
<p class="text-white text-xl font-bold">1</p>
</div>
</div>
<!-- How it works -->
<div class="flex flex-col gap-4 pt-4">
<h3 class="text-white text-lg font-bold">How it works</h3>
<div class="flex flex-col gap-4">
<!-- Step 1 -->
<div class="flex gap-4 items-start">
<div class="flex-none size-10 rounded-full bg-surface-highlight flex items-center justify-center border border-white/5 text-white font-bold">
<span class="material-symbols-outlined text-sm">group_add</span>
</div>
<div class="flex flex-col gap-1">
<p class="text-white text-sm font-bold">Invite friends</p>
<p class="text-text-secondary text-xs leading-relaxed">Share your unique link via SMS, Email, or Social Media.</p>
</div>
</div>
<!-- Line connector -->
<div class="ml-5 w-px h-4 bg-white/10 -my-2"></div>
<!-- Step 2 -->
<div class="flex gap-4 items-start">
<div class="flex-none size-10 rounded-full bg-surface-highlight flex items-center justify-center border border-white/5 text-white font-bold">
<span class="material-symbols-outlined text-sm">verified</span>
</div>
<div class="flex flex-col gap-1">
<p class="text-white text-sm font-bold">They join &amp; complete a campaign</p>
<p class="text-text-secondary text-xs leading-relaxed">Your friend signs up and submits their first deliverable.</p>
</div>
</div>
<!-- Line connector -->
<div class="ml-5 w-px h-4 bg-white/10 -my-2"></div>
<!-- Step 3 -->
<div class="flex gap-4 items-start">
<div class="flex-none size-10 rounded-full bg-surface-highlight flex items-center justify-center border border-primary/30 text-primary font-bold shadow-[0_0_10px_rgba(19,55,236,0.2)]">
<span class="material-symbols-outlined text-sm">monetization_on</span>
</div>
<div class="flex flex-col gap-1">
<p class="text-white text-sm font-bold">You get paid</p>
<p class="text-text-secondary text-xs leading-relaxed">We deposit $50 directly into your CreatorX wallet.</p>
</div>
</div>
</div>
</div>
<!-- Recent Activity List (Bonus for structure) -->
<div class="flex flex-col gap-3 pt-4 pb-8">
<div class="flex items-center justify-between">
<h3 class="text-white text-lg font-bold">Recent Invites</h3>
<span class="text-primary text-xs font-bold cursor-pointer">View All</span>
</div>
<!-- Item 1 -->
<div class="flex items-center justify-between p-3 rounded-xl bg-surface-dark border border-white/5">
<div class="flex items-center gap-3">
<div class="size-10 rounded-full bg-center bg-cover" data-alt="Portrait of a female creator" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuBIYaVMfwqgyNjQcqmyjw9Dy2DTvEEICgUk-6i3VjH0QI6dUgaE2q-AyDtbjPCIKB8Vfez6QzZ3_UDhYok0vUe3n3E9vjCWz80hTTejIGyVwZOXtWhIsAZY0mff-75znLr1emLlaRSMTaZDlLiIjdir2n0qKwHQg4Uw5C_4oqBwwausRFnB2DU3UqCP9fOEe_vmyQGSql-Isjdvm0JifYvhKbPuJnDW722uBa1hDWl-VCzSl4rD244lgVFh7ymb5mWDP3kaeIJVE5M')"></div>
<div class="flex flex-col">
<p class="text-white text-sm font-bold">Sarah Jenkins</p>
<p class="text-text-secondary text-[10px]">Joined 2 days ago</p>
</div>
</div>
<div class="px-2 py-1 rounded bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-bold uppercase tracking-wide">
                        Success
                    </div>
</div>
<!-- Item 2 -->
<div class="flex items-center justify-between p-3 rounded-xl bg-surface-dark border border-white/5">
<div class="flex items-center gap-3">
<div class="size-10 rounded-full bg-surface-highlight flex items-center justify-center text-text-secondary text-xs font-bold">MJ</div>
<div class="flex flex-col">
<p class="text-white text-sm font-bold">Mike Johnson</p>
<p class="text-text-secondary text-[10px]">Invite sent</p>
</div>
</div>
<div class="px-2 py-1 rounded bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-[10px] font-bold uppercase tracking-wide">
                        Pending
                    </div>
</div>
</div>
</div>
<!-- Bottom padding for safe area -->
<div class="h-6 w-full"></div>
</div>
</body></html>
```


---

## SCREEN: saved_campaigns

Path: `screens/saved_campaigns/index.html`

```html
<!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Saved Campaigns - CreatorX</title>
<!-- Fonts -->
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&amp;display=swap" rel="stylesheet"/>
<!-- Material Symbols -->
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<!-- Tailwind CSS -->
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#1337ec",
                        "background-light": "#f6f6f8",
                        "background-dark": "#101322",
                        "surface-dark": "#1c1f2e", // Slightly lighter than background-dark for cards
                    },
                    fontFamily: {
                        "display": ["Plus Jakarta Sans", "sans-serif"]
                    },
                    borderRadius: {"DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "2xl": "1rem", "full": "9999px"},
                },
            },
        }
    </script>
<style>
        /* Custom Scrollbar for horizontal lists */
        .no-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
        
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .material-symbols-outlined.filled {
            font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display antialiased overflow-x-hidden selection:bg-primary selection:text-white">
<div class="relative flex h-full min-h-screen w-full flex-col max-w-md mx-auto bg-background-light dark:bg-background-dark shadow-2xl overflow-hidden border-x border-white/5">
<!-- Header -->
<header class="sticky top-0 z-20 flex items-center justify-between px-4 pt-6 pb-2 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md border-b border-black/5 dark:border-white/5">
<button class="flex size-10 items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
<span class="material-symbols-outlined text-slate-900 dark:text-white" style="font-size: 24px;">arrow_back</span>
</button>
<h1 class="text-lg font-bold leading-tight tracking-tight flex-1 text-center pr-10">Saved Campaigns</h1>
<div class="absolute right-4 flex items-center">
<button class="flex size-10 items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
<span class="material-symbols-outlined text-slate-900 dark:text-white" style="font-size: 24px;">tune</span>
</button>
</div>
</header>
<!-- Filters -->
<div class="w-full overflow-x-auto no-scrollbar py-4 pl-4 sticky top-[60px] z-10 bg-background-light dark:bg-background-dark">
<div class="flex gap-3 pr-4">
<button class="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full bg-primary px-5 shadow-lg shadow-primary/20 transition-transform active:scale-95">
<span class="text-white text-sm font-semibold">All</span>
</button>
<button class="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/5 px-5 transition-colors hover:bg-slate-100 dark:hover:bg-white/5">
<span class="text-slate-600 dark:text-gray-300 text-sm font-medium">Instagram</span>
</button>
<button class="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/5 px-5 transition-colors hover:bg-slate-100 dark:hover:bg-white/5">
<span class="text-slate-600 dark:text-gray-300 text-sm font-medium">TikTok</span>
</button>
<button class="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/5 px-5 transition-colors hover:bg-slate-100 dark:hover:bg-white/5">
<span class="text-slate-600 dark:text-gray-300 text-sm font-medium">YouTube</span>
</button>
<button class="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/5 px-5 transition-colors hover:bg-slate-100 dark:hover:bg-white/5">
<span class="text-slate-600 dark:text-gray-300 text-sm font-medium">High Payout</span>
</button>
</div>
</div>
<!-- Campaign List -->
<main class="flex-1 flex flex-col px-4 gap-4 pb-24">
<!-- Card 1: Sephora -->
<div class="group relative flex flex-col gap-3 p-4 rounded-2xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/5 shadow-sm hover:shadow-md transition-all active:scale-[0.99]">
<div class="flex justify-between items-start">
<div class="flex gap-3 items-center">
<div class="relative size-12 rounded-xl overflow-hidden bg-slate-100 dark:bg-white/5 shrink-0">
<div class="absolute inset-0 bg-gradient-to-br from-pink-500 to-rose-500" data-alt="Abstract gradient representing beauty brand logo"></div>
<div class="absolute inset-0 flex items-center justify-center text-white font-bold text-xs">S</div>
</div>
<div class="flex flex-col">
<h3 class="text-base font-bold text-slate-900 dark:text-white leading-tight">Summer Glow Campaign</h3>
<p class="text-slate-500 dark:text-slate-400 text-xs font-medium mt-0.5">Sephora</p>
</div>
</div>
<button class="text-primary hover:text-primary/80 transition-colors p-1 -mr-1">
<span class="material-symbols-outlined filled" style="font-size: 24px;">bookmark</span>
</button>
</div>
<div class="flex flex-wrap items-center gap-2 mt-1">
<div class="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-pink-50 dark:bg-pink-500/10 border border-pink-100 dark:border-pink-500/20">
<span class="material-symbols-outlined text-pink-600 dark:text-pink-400" style="font-size: 14px;">music_note</span>
<span class="text-xs font-semibold text-pink-700 dark:text-pink-300">TikTok</span>
</div>
<div class="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10">
<span class="material-symbols-outlined text-slate-500 dark:text-slate-400" style="font-size: 14px;">schedule</span>
<span class="text-xs font-medium text-slate-600 dark:text-slate-400">Due in 3 days</span>
</div>
</div>
<div class="h-px w-full bg-slate-100 dark:bg-white/5 my-1"></div>
<div class="flex items-center justify-between">
<div class="flex flex-col">
<span class="text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500">Payout</span>
<span class="text-lg font-bold text-slate-900 dark:text-white">$1,200</span>
</div>
<button class="h-9 px-4 rounded-lg bg-primary/10 hover:bg-primary/20 dark:bg-primary dark:hover:bg-primary/90 text-primary dark:text-white text-sm font-semibold transition-colors flex items-center gap-1">
                        View Details
                        <span class="material-symbols-outlined" style="font-size: 16px;">arrow_forward</span>
</button>
</div>
</div>
<!-- Card 2: Sony -->
<div class="group relative flex flex-col gap-3 p-4 rounded-2xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/5 shadow-sm hover:shadow-md transition-all active:scale-[0.99]">
<div class="flex justify-between items-start">
<div class="flex gap-3 items-center">
<div class="relative size-12 rounded-xl overflow-hidden bg-slate-100 dark:bg-white/5 shrink-0">
<div class="absolute inset-0 bg-gradient-to-tr from-slate-800 to-black" data-alt="Abstract dark geometric pattern for tech brand"></div>
<div class="absolute inset-0 flex items-center justify-center text-white font-bold text-xs">SONY</div>
</div>
<div class="flex flex-col">
<h3 class="text-base font-bold text-slate-900 dark:text-white leading-tight">Tech Review 2024</h3>
<p class="text-slate-500 dark:text-slate-400 text-xs font-medium mt-0.5">Sony Electronics</p>
</div>
</div>
<button class="text-primary hover:text-primary/80 transition-colors p-1 -mr-1">
<span class="material-symbols-outlined filled" style="font-size: 24px;">bookmark</span>
</button>
</div>
<div class="flex flex-wrap items-center gap-2 mt-1">
<div class="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20">
<span class="material-symbols-outlined text-red-600 dark:text-red-400" style="font-size: 14px;">smart_display</span>
<span class="text-xs font-semibold text-red-700 dark:text-red-300">YouTube</span>
</div>
<div class="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10">
<span class="material-symbols-outlined text-slate-500 dark:text-slate-400" style="font-size: 14px;">schedule</span>
<span class="text-xs font-medium text-slate-600 dark:text-slate-400">1 week left</span>
</div>
</div>
<div class="h-px w-full bg-slate-100 dark:bg-white/5 my-1"></div>
<div class="flex items-center justify-between">
<div class="flex flex-col">
<span class="text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500">Payout</span>
<span class="text-lg font-bold text-slate-900 dark:text-white">$2,500</span>
</div>
<button class="h-9 px-4 rounded-lg bg-primary/10 hover:bg-primary/20 dark:bg-white/5 dark:hover:bg-white/10 text-primary dark:text-white text-sm font-semibold transition-colors flex items-center gap-1">
                        View Details
                    </button>
</div>
</div>
<!-- Card 3: Gymshark -->
<div class="group relative flex flex-col gap-3 p-4 rounded-2xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/5 shadow-sm hover:shadow-md transition-all active:scale-[0.99]">
<div class="flex justify-between items-start">
<div class="flex gap-3 items-center">
<div class="relative size-12 rounded-xl overflow-hidden bg-slate-100 dark:bg-white/5 shrink-0">
<div class="absolute inset-0 bg-gradient-to-br from-cyan-400 to-blue-500" data-alt="Abstract blue cyan gradient for fitness brand"></div>
<div class="absolute inset-0 flex items-center justify-center text-white font-bold text-xs">GS</div>
</div>
<div class="flex flex-col">
<h3 class="text-base font-bold text-slate-900 dark:text-white leading-tight">Fitness Challenge</h3>
<p class="text-slate-500 dark:text-slate-400 text-xs font-medium mt-0.5">Gymshark</p>
</div>
</div>
<button class="text-primary hover:text-primary/80 transition-colors p-1 -mr-1">
<span class="material-symbols-outlined filled" style="font-size: 24px;">bookmark</span>
</button>
</div>
<div class="flex flex-wrap items-center gap-2 mt-1">
<div class="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-50 dark:bg-purple-500/10 border border-purple-100 dark:border-purple-500/20">
<span class="material-symbols-outlined text-purple-600 dark:text-purple-400" style="font-size: 14px;">photo_camera</span>
<span class="text-xs font-semibold text-purple-700 dark:text-purple-300">Reels</span>
</div>
<div class="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20">
<span class="material-symbols-outlined text-amber-600 dark:text-amber-400" style="font-size: 14px;">inventory_2</span>
<span class="text-xs font-semibold text-amber-700 dark:text-amber-300">Product Exchange</span>
</div>
</div>
<div class="h-px w-full bg-slate-100 dark:bg-white/5 my-1"></div>
<div class="flex items-center justify-between">
<div class="flex flex-col">
<span class="text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500">Payout</span>
<span class="text-lg font-bold text-slate-900 dark:text-white">$800 <span class="text-sm font-normal text-slate-500 dark:text-slate-400">+ Gear</span></span>
</div>
<button class="h-9 px-4 rounded-lg bg-primary/10 hover:bg-primary/20 dark:bg-white/5 dark:hover:bg-white/10 text-primary dark:text-white text-sm font-semibold transition-colors flex items-center gap-1">
                        View Details
                    </button>
</div>
</div>
<!-- Card 4: Adobe (Expired state example) -->
<div class="group relative flex flex-col gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-surface-dark/50 border border-slate-200 dark:border-white/5 shadow-sm opacity-70">
<div class="flex justify-between items-start">
<div class="flex gap-3 items-center">
<div class="relative size-12 rounded-xl overflow-hidden bg-slate-200 dark:bg-white/5 shrink-0 grayscale">
<div class="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500" data-alt="Abstract colorful gradient for creative software brand"></div>
<div class="absolute inset-0 flex items-center justify-center text-white font-bold text-xs">Ad</div>
</div>
<div class="flex flex-col">
<h3 class="text-base font-bold text-slate-700 dark:text-slate-300 leading-tight">Creative Cloud Promo</h3>
<p class="text-slate-400 dark:text-slate-500 text-xs font-medium mt-0.5">Adobe</p>
</div>
</div>
<button class="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors p-1 -mr-1">
<span class="material-symbols-outlined filled" style="font-size: 24px;">bookmark</span>
</button>
</div>
<div class="flex flex-wrap items-center gap-2 mt-1">
<div class="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
<span class="material-symbols-outlined text-slate-500" style="font-size: 14px;">music_note</span>
<span class="text-xs font-medium text-slate-500">TikTok</span>
</div>
<div class="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
<span class="text-xs font-bold text-slate-500">Closed</span>
</div>
</div>
<div class="h-px w-full bg-slate-200 dark:bg-white/5 my-1"></div>
<div class="flex items-center justify-between">
<div class="flex flex-col">
<span class="text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500">Payout</span>
<span class="text-lg font-bold text-slate-600 dark:text-slate-400">$1,500</span>
</div>
<button class="h-9 px-4 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-slate-500 text-sm font-semibold cursor-not-allowed">
                        Closed
                    </button>
</div>
</div>
</main>
<!-- Bottom Navigation -->
<nav class="fixed bottom-0 left-0 right-0 z-30 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-xl border-t border-slate-200 dark:border-white/5 pb-5 pt-3 max-w-md mx-auto">
<div class="flex justify-around items-center px-2">
<button class="flex flex-col items-center gap-1 p-2 text-slate-400 dark:text-slate-500 hover:text-primary transition-colors">
<span class="material-symbols-outlined" style="font-size: 26px;">home</span>
<span class="text-[10px] font-medium">Home</span>
</button>
<button class="flex flex-col items-center gap-1 p-2 text-slate-400 dark:text-slate-500 hover:text-primary transition-colors">
<span class="material-symbols-outlined" style="font-size: 26px;">search</span>
<span class="text-[10px] font-medium">Discover</span>
</button>
<button class="flex flex-col items-center gap-1 p-2 text-primary dark:text-white transition-colors relative">
<span class="material-symbols-outlined filled" style="font-size: 26px;">bookmark</span>
<span class="text-[10px] font-bold">Saved</span>
<span class="absolute top-2 right-4 size-2 bg-primary rounded-full"></span>
</button>
<button class="flex flex-col items-center gap-1 p-2 text-slate-400 dark:text-slate-500 hover:text-primary transition-colors">
<span class="material-symbols-outlined" style="font-size: 26px;">chat_bubble</span>
<span class="text-[10px] font-medium">Chat</span>
</button>
<button class="flex flex-col items-center gap-1 p-2 text-slate-400 dark:text-slate-500 hover:text-primary transition-colors">
<span class="material-symbols-outlined" style="font-size: 26px;">person</span>
<span class="text-[10px] font-medium">Profile</span>
</button>
</div>
</nav>
<!-- Gradient Overlay for Bottom Nav Fade -->
<div class="fixed bottom-[80px] left-0 right-0 h-12 bg-gradient-to-t from-background-light dark:from-background-dark to-transparent pointer-events-none max-w-md mx-auto z-10"></div>
</div>
</body></html>
```


---

## SCREEN: updates_hub

Path: `screens/updates_hub/index.html`

```html
<!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>CreatorX Updates</title>
<!-- Fonts -->
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&amp;display=swap" rel="stylesheet"/>
<!-- Material Symbols -->
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<!-- Tailwind CSS -->
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<!-- Theme Config -->
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#1337ec",
                        "background-light": "#f6f6f8",
                        "background-dark": "#101322", // Using theme provided dark background
                        "surface-dark": "#1C1C1E", // Custom surface color for cards
                    },
                    fontFamily: {
                        "display": ["Plus Jakarta Sans", "sans-serif"]
                    },
                    borderRadius: {"DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "full": "9999px"},
                },
            },
        }
    </script>
<style>
        /* Custom scrollbar hiding for clean UI */
        .no-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
        
        /* Mobile safe area spacing */
        .safe-pb {
            padding-bottom: env(safe-area-inset-bottom);
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-white antialiased selection:bg-primary/30">
<!-- Mobile Container -->
<div class="relative flex min-h-screen w-full flex-col mx-auto max-w-[480px] overflow-x-hidden bg-background-light dark:bg-background-dark shadow-2xl">
<!-- Header -->
<header class="sticky top-0 z-30 flex items-center justify-between bg-background-light/95 dark:bg-background-dark/95 px-5 pt-4 pb-2 backdrop-blur-xl">
<h1 class="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Updates</h1>
<button class="group flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 dark:bg-surface-dark transition active:scale-95">
<span class="material-symbols-outlined text-slate-600 dark:text-white group-hover:text-primary transition-colors" style="font-size: 24px;">edit_square</span>
</button>
</header>
<!-- Search Bar -->
<div class="px-5 py-3 sticky top-[60px] z-20 bg-background-light dark:bg-background-dark">
<div class="relative flex w-full items-center rounded-xl bg-white dark:bg-surface-dark shadow-sm ring-1 ring-slate-900/5 dark:ring-white/10">
<div class="flex h-12 w-12 items-center justify-center text-slate-400">
<span class="material-symbols-outlined" style="font-size: 22px;">search</span>
</div>
<input class="h-full w-full border-none bg-transparent py-3 pr-4 text-base text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-0" placeholder="Search messages &amp; alerts"/>
</div>
</div>
<!-- Segmented Control -->
<div class="px-5 pb-6">
<div class="flex h-12 w-full rounded-xl bg-slate-200 dark:bg-surface-dark p-1 relative">
<!-- Active Indicator Background (visually simulated for 'Messages') -->
<div class="absolute left-1 top-1 bottom-1 w-[calc(50%-4px)] rounded-lg bg-white dark:bg-primary shadow-sm"></div>
<button class="relative z-10 flex flex-1 items-center justify-center rounded-lg text-sm font-semibold text-slate-900 dark:text-white">
                    Messages
                </button>
<button class="relative z-10 flex flex-1 items-center justify-center rounded-lg text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
                    Notifications
                    <!-- Badge for Notifications -->
<span class="ml-2 flex h-2 w-2 rounded-full bg-red-500"></span>
</button>
</div>
</div>
<!-- Messages List -->
<main class="flex-1 flex flex-col gap-1 px-5 pb-24">
<!-- Item 1: Unread -->
<div class="group flex items-center gap-4 rounded-xl p-3 -mx-3 hover:bg-slate-100 dark:hover:bg-surface-dark/50 transition-colors cursor-pointer relative">
<!-- Unread Indicator (Blue Dot) -->
<div class="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col items-end gap-1">
<span class="text-xs font-medium text-primary">2m</span>
<div class="h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_8px_rgba(19,55,236,0.5)]"></div>
</div>
<div class="relative shrink-0">
<div class="h-14 w-14 overflow-hidden rounded-full ring-2 ring-slate-100 dark:ring-white/10" data-alt="Nike logo abstract representation" style="background: linear-gradient(135deg, #111 0%, #333 100%); display: flex; align-items: center; justify-content: center;">
<span class="text-white font-bold text-xs tracking-widest">NIKE</span>
</div>
<div class="absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-2 border-white dark:border-background-dark bg-green-500"></div>
</div>
<div class="flex flex-col justify-center pr-8">
<p class="text-base font-bold text-slate-900 dark:text-white">Nike</p>
<p class="line-clamp-1 text-sm font-medium text-slate-900 dark:text-white/90">Hey! Just checking in on the reels draft. We need the raw files by EOD.</p>
</div>
</div>
<!-- Item 2: Unread -->
<div class="group flex items-center gap-4 rounded-xl p-3 -mx-3 hover:bg-slate-100 dark:hover:bg-surface-dark/50 transition-colors cursor-pointer relative">
<div class="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col items-end gap-1">
<span class="text-xs font-medium text-slate-500">1h</span>
<div class="h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_8px_rgba(19,55,236,0.5)]"></div>
</div>
<div class="relative shrink-0">
<img alt="Sephora brand avatar" class="h-14 w-14 rounded-full object-cover ring-2 ring-slate-100 dark:ring-white/10" data-alt="Sephora logo on black background" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC3dzIh_KiIob4-JxpATiBjmJYhoszS5oHc3s7ghPKW7a6ucBFUfDiYMuBqar7Y8vGX4BtsG2z4N_ERXck6y4216gd9KE4YKfOLef3GkUwQW4VQEWxTSSSp_qkgPj2Fd7KAlNpvNdQ5syPCJpDgOHFHTPMzu5c2sPtleqJxvcNqDaMkW5QLdYswIplzTNF5fwtGPgv-V2XRjtuiyG7kYKLd9fY_VDmM0AcjLsy-PGUX8taE4ZjCmFDxeO4sXFYk57-7al-kCjAxyIk"/>
</div>
<div class="flex flex-col justify-center pr-8">
<p class="text-base font-bold text-slate-900 dark:text-white">Sephora</p>
<p class="line-clamp-1 text-sm font-medium text-slate-900 dark:text-white/90">Proposal accepted! 🎉 Please sign the contract attached.</p>
</div>
</div>
<!-- Item 3: Read -->
<div class="group flex items-center gap-4 rounded-xl p-3 -mx-3 hover:bg-slate-100 dark:hover:bg-surface-dark/50 transition-colors cursor-pointer relative">
<div class="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col items-end gap-1">
<span class="text-xs font-medium text-slate-400">1d</span>
</div>
<div class="relative shrink-0">
<div class="h-14 w-14 overflow-hidden rounded-full bg-primary flex items-center justify-center ring-2 ring-slate-100 dark:ring-white/10">
<span class="material-symbols-outlined text-white" style="font-size: 28px;">verified</span>
</div>
</div>
<div class="flex flex-col justify-center pr-8">
<div class="flex items-center gap-1">
<p class="text-base font-bold text-slate-900 dark:text-white">CreatorX Support</p>
<span class="material-symbols-outlined text-blue-400" style="font-size: 16px;">verified</span>
</div>
<p class="line-clamp-1 text-sm font-normal text-slate-500 dark:text-slate-400">Your payment of $500 has been processed to your wallet.</p>
</div>
</div>
<!-- Item 4: Read -->
<div class="group flex items-center gap-4 rounded-xl p-3 -mx-3 hover:bg-slate-100 dark:hover:bg-surface-dark/50 transition-colors cursor-pointer relative opacity-80 hover:opacity-100">
<div class="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col items-end gap-1">
<span class="text-xs font-medium text-slate-400">2d</span>
</div>
<div class="relative shrink-0">
<div class="h-14 w-14 overflow-hidden rounded-full ring-2 ring-slate-100 dark:ring-white/10" data-alt="Adidas logo abstract representation" style="background: linear-gradient(45deg, #000 0%, #444 100%); display: flex; align-items: center; justify-content: center;">
<span class="material-symbols-outlined text-white" style="font-size: 24px;">sports_handball</span>
</div>
</div>
<div class="flex flex-col justify-center pr-8">
<p class="text-base font-bold text-slate-900 dark:text-white">Adidas</p>
<p class="line-clamp-1 text-sm font-normal text-slate-500 dark:text-slate-400">Thanks for the update. Let's schedule a call next week.</p>
</div>
</div>
<!-- Item 5: Read -->
<div class="group flex items-center gap-4 rounded-xl p-3 -mx-3 hover:bg-slate-100 dark:hover:bg-surface-dark/50 transition-colors cursor-pointer relative opacity-80 hover:opacity-100">
<div class="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col items-end gap-1">
<span class="text-xs font-medium text-slate-400">1w</span>
</div>
<div class="relative shrink-0">
<img alt="Gymshark brand avatar" class="h-14 w-14 rounded-full object-cover ring-2 ring-slate-100 dark:ring-white/10" data-alt="Red shoe on white background" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDKmoOikdPQuUgrqHqtUwZZYECD6AHakAkjOajwlrbX8Y1veYy4gt_uf6EYP2kTExR3u90-QZqdN0vHpqdvd5eMj2NO35qpy71nuGkK8X78wslzbKkaDPGegr4vedJb55XtJCvkqe637o8ATvvndoM7pI7pNX-0lJ4HzXaY7oegymk5f2PMjnwPiF8Q_jzr9lLehAdTrJ3n4btBoRrNzky7tIm3RjkxBh_00N-lTy9pd3BY2yxD0hP4uiXipP22C_sA3-46sgYSW18"/>
</div>
<div class="flex flex-col justify-center pr-8">
<p class="text-base font-bold text-slate-900 dark:text-white">Gymshark</p>
<p class="line-clamp-1 text-sm font-normal text-slate-500 dark:text-slate-400">Looking forward to seeing the content!</p>
</div>
</div>
</main>
<!-- Bottom Navigation -->
<nav class="fixed bottom-0 w-full max-w-[480px] bg-background-light/90 dark:bg-background-dark/95 border-t border-slate-200 dark:border-white/5 backdrop-blur-lg safe-pb">
<div class="flex justify-around items-end h-[60px] pb-2">
<a class="flex flex-col items-center justify-center w-full gap-1 group" href="#">
<span class="material-symbols-outlined text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors" style="font-size: 24px;">home</span>
<span class="text-[10px] font-medium text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200">Home</span>
</a>
<a class="flex flex-col items-center justify-center w-full gap-1 group" href="#">
<span class="material-symbols-outlined text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors" style="font-size: 24px;">rocket_launch</span>
<span class="text-[10px] font-medium text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200">Campaigns</span>
</a>
<!-- Active Tab -->
<a class="flex flex-col items-center justify-center w-full gap-1" href="#">
<div class="relative">
<span class="material-symbols-outlined text-primary fill-current" style="font-size: 24px; font-variation-settings: 'FILL' 1;">forum</span>
<span class="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-red-500 ring-2 ring-white dark:ring-background-dark"></span>
</div>
<span class="text-[10px] font-bold text-primary">Updates</span>
</a>
<a class="flex flex-col items-center justify-center w-full gap-1 group" href="#">
<span class="material-symbols-outlined text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors" style="font-size: 24px;">account_balance_wallet</span>
<span class="text-[10px] font-medium text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200">Wallet</span>
</a>
<a class="flex flex-col items-center justify-center w-full gap-1 group" href="#">
<div class="h-6 w-6 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden ring-2 ring-transparent group-hover:ring-slate-300 dark:group-hover:ring-slate-600 transition-all">
<img alt="User profile" class="h-full w-full object-cover" data-alt="Profile picture of a woman" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCqkxuzwjrWNOuchSCdftbY8XqYctuP6KkFUp0PW3kBv4RedpSxEs_CuWbpcc4yrRJ8C-QgUIKCTtsgcGDXmiWjmfYMpzKnnTtmrIUpIunnSuFDL2hy36GXQM2n429rIAQvs7z0wh4V-OKdP45YYgeGcH4zuNf9K_OVDkVuUk2nbhtwDuQ_T1-h--UG-FulNIUBE-Ve2axXN7-6-FWD8Kd_x6CDTuiF9Zbdl8wodiAQP6I_A1QxyBNXsF24RiCrpI6VnyGQEgTGDGI"/>
</div>
<span class="text-[10px] font-medium text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200">Profile</span>
</a>
</div>
</nav>
</div>
</body></html>
```


---

## SCREEN: wallet__earnings___transactions

Path: `screens/wallet__earnings___transactions/index.html`

```html
<!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>CreatorX Wallet</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#1337ec",
                        "background-light": "#ffffff",
                        "background-dark": "#050505", // Deep black for premium feel
                        "surface-dark": "#121212", // Slightly lighter for cards
                        "surface-light": "#f6f6f8",
                    },
                    fontFamily: {
                        "display": ["Plus Jakarta Sans", "sans-serif"]
                    },
                    borderRadius: {
                        "DEFAULT": "0.5rem",
                        "lg": "0.75rem",
                        "xl": "1rem",
                        "2xl": "1.5rem",
                        "full": "9999px"
                    },
                },
            },
        }
    </script>
<style>
        .no-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="font-display bg-background-light dark:bg-background-dark text-slate-900 dark:text-white antialiased overflow-hidden selection:bg-primary/30">
<div class="relative flex h-full max-h-screen w-full flex-col overflow-hidden">
<!-- Header -->
<div class="flex items-center px-4 pt-4 pb-2 justify-between z-10 shrink-0">
<button class="flex h-10 w-10 items-center justify-center rounded-full active:bg-slate-100 dark:active:bg-white/10 transition-colors">
<span class="material-symbols-outlined text-slate-900 dark:text-white text-[24px]">arrow_back</span>
</button>
<h2 class="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">Wallet</h2>
<button class="flex h-10 w-10 items-center justify-center rounded-full active:bg-slate-100 dark:active:bg-white/10 transition-colors">
<span class="material-symbols-outlined text-slate-900 dark:text-white text-[24px]">settings</span>
</button>
</div>
<!-- Scrollable Content Area -->
<div class="flex-1 overflow-y-auto no-scrollbar pb-24"> <!-- pb-24 for fixed button space -->
<!-- Balance Section -->
<div class="flex flex-col items-center pt-6 pb-6">
<div class="flex items-center gap-2">
<p class="text-slate-500 dark:text-[#9da1b9] text-sm font-medium leading-normal">Available Balance</p>
<button class="text-slate-400 dark:text-[#555] hover:text-primary transition-colors">
<span class="material-symbols-outlined text-[18px]">visibility</span>
</button>
</div>
<h1 class="text-slate-900 dark:text-white tracking-tight text-[40px] font-extrabold leading-tight mt-1 mb-6">$12,450.00</h1>
<!-- Stats Cards -->
<div class="flex w-full px-4 gap-3">
<div class="flex flex-1 flex-col gap-1 rounded-2xl bg-slate-50 dark:bg-surface-dark border border-slate-100 dark:border-white/5 p-4 items-center text-center">
<div class="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-500/10 mb-1">
<span class="material-symbols-outlined text-yellow-500 text-[18px]">hourglass_empty</span>
</div>
<p class="text-slate-900 dark:text-white text-lg font-bold leading-tight">$1,200.00</p>
<p class="text-slate-500 dark:text-[#9da1b9] text-xs font-medium">Pending</p>
</div>
<div class="flex flex-1 flex-col gap-1 rounded-2xl bg-slate-50 dark:bg-surface-dark border border-slate-100 dark:border-white/5 p-4 items-center text-center">
<div class="flex items-center justify-center w-8 h-8 rounded-full bg-green-500/10 mb-1">
<span class="material-symbols-outlined text-green-500 text-[18px]">payments</span>
</div>
<p class="text-slate-900 dark:text-white text-lg font-bold leading-tight">$45,200.00</p>
<p class="text-slate-500 dark:text-[#9da1b9] text-xs font-medium">Total Earned</p>
</div>
</div>
</div>
<!-- Chart Section -->
<div class="px-4 mt-2 mb-6">
<div class="flex justify-between items-end mb-4 px-1">
<h3 class="text-slate-900 dark:text-white text-base font-bold">Earnings</h3>
<p class="text-slate-400 dark:text-[#9da1b9] text-xs font-medium">Last 30 Days</p>
</div>
<!-- Simplified Chart Visualization -->
<div class="w-full h-40 bg-slate-50 dark:bg-surface-dark rounded-2xl border border-slate-100 dark:border-white/5 p-4 relative overflow-hidden group">
<!-- Interactive tooltip placeholder -->
<div class="absolute top-2 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        $850.00 on Oct 12
                    </div>
<!-- Bars -->
<div class="flex items-end justify-between h-full gap-1 pt-4">
<div class="w-full bg-primary/20 hover:bg-primary transition-colors rounded-t-sm h-[30%]"></div>
<div class="w-full bg-primary/20 hover:bg-primary transition-colors rounded-t-sm h-[50%]"></div>
<div class="w-full bg-primary/20 hover:bg-primary transition-colors rounded-t-sm h-[40%]"></div>
<div class="w-full bg-primary/20 hover:bg-primary transition-colors rounded-t-sm h-[70%]"></div>
<div class="w-full bg-primary/20 hover:bg-primary transition-colors rounded-t-sm h-[45%]"></div>
<div class="w-full bg-primary/20 hover:bg-primary transition-colors rounded-t-sm h-[60%]"></div>
<div class="w-full bg-primary/20 hover:bg-primary transition-colors rounded-t-sm h-[30%]"></div>
<div class="w-full bg-primary/20 hover:bg-primary transition-colors rounded-t-sm h-[80%]"></div>
<div class="w-full bg-primary/20 hover:bg-primary transition-colors rounded-t-sm h-[55%]"></div>
<div class="w-full bg-primary/20 hover:bg-primary transition-colors rounded-t-sm h-[40%]"></div>
<div class="w-full bg-primary/20 hover:bg-primary transition-colors rounded-t-sm h-[90%]"></div>
<div class="w-full bg-primary/20 hover:bg-primary transition-colors rounded-t-sm h-[65%]"></div>
<div class="w-full bg-primary/20 hover:bg-primary transition-colors rounded-t-sm h-[40%]"></div>
<div class="w-full bg-primary hover:bg-primary/80 transition-colors rounded-t-sm h-[75%] relative">
<!-- Active indicator -->
<div class="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_8px_rgba(19,55,236,0.8)]"></div>
</div>
</div>
</div>
</div>
<!-- Transactions Section -->
<div class="px-4 pb-4">
<div class="flex items-center justify-between mb-4">
<h3 class="text-slate-900 dark:text-white text-base font-bold pl-1">Recent Transactions</h3>
<button class="text-primary text-xs font-bold px-2 py-1">View All</button>
</div>
<!-- Filters -->
<div class="flex gap-2 overflow-x-auto no-scrollbar mb-4 pb-1 pl-1">
<button class="bg-primary text-white px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shadow-lg shadow-primary/25">All</button>
<button class="bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border border-transparent dark:border-white/10 hover:border-primary/50 transition-colors">Incoming</button>
<button class="bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border border-transparent dark:border-white/10 hover:border-primary/50 transition-colors">Withdrawals</button>
</div>
<!-- Transaction List -->
<div class="flex flex-col gap-3">
<!-- Item 1 -->
<div class="group flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-surface-dark border border-slate-100 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer">
<div class="flex items-center gap-3">
<div class="h-10 w-10 rounded-full bg-white dark:bg-white/10 flex items-center justify-center text-slate-900 dark:text-white">
<span class="material-symbols-outlined text-[20px]">north_east</span>
</div>
<div class="flex flex-col">
<p class="text-slate-900 dark:text-white text-sm font-bold">Nike Campaign Payout</p>
<p class="text-slate-500 dark:text-slate-400 text-xs">Today, 10:23 AM</p>
</div>
</div>
<div class="flex flex-col items-end">
<p class="text-emerald-500 dark:text-emerald-400 text-sm font-bold">+$500.00</p>
<div class="flex items-center gap-1">
<span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
<p class="text-slate-400 text-[10px] font-medium uppercase tracking-wide">Completed</p>
</div>
</div>
</div>
<!-- Item 2 -->
<div class="group flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-surface-dark border border-slate-100 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer">
<div class="flex items-center gap-3">
<div class="h-10 w-10 rounded-full bg-white dark:bg-white/10 flex items-center justify-center text-slate-900 dark:text-white">
<span class="material-symbols-outlined text-[20px]">south_west</span>
</div>
<div class="flex flex-col">
<p class="text-slate-900 dark:text-white text-sm font-bold">Withdrawal to Chase</p>
<p class="text-slate-500 dark:text-slate-400 text-xs">Yesterday, 4:15 PM</p>
</div>
</div>
<div class="flex flex-col items-end">
<p class="text-slate-900 dark:text-white text-sm font-bold">-$2,000.00</p>
<div class="flex items-center gap-1">
<span class="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"></span>
<p class="text-slate-400 text-[10px] font-medium uppercase tracking-wide">Processing</p>
</div>
</div>
</div>
<!-- Item 3 -->
<div class="group flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-surface-dark border border-slate-100 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer">
<div class="flex items-center gap-3">
<div class="h-10 w-10 rounded-full bg-white dark:bg-white/10 flex items-center justify-center text-slate-900 dark:text-white">
<span class="material-symbols-outlined text-[20px]">north_east</span>
</div>
<div class="flex flex-col">
<p class="text-slate-900 dark:text-white text-sm font-bold">Skincare Reel Collab</p>
<p class="text-slate-500 dark:text-slate-400 text-xs">Oct 24, 2023</p>
</div>
</div>
<div class="flex flex-col items-end">
<p class="text-slate-400 dark:text-slate-500 text-sm font-bold">+$1,200.00</p>
<div class="flex items-center gap-1">
<span class="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
<p class="text-slate-400 text-[10px] font-medium uppercase tracking-wide">Pending</p>
</div>
</div>
</div>
<!-- Item 4 -->
<div class="group flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-surface-dark border border-slate-100 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer">
<div class="flex items-center gap-3">
<div class="h-10 w-10 rounded-full bg-white dark:bg-white/10 flex items-center justify-center text-slate-900 dark:text-white">
<span class="material-symbols-outlined text-[20px]">north_east</span>
</div>
<div class="flex flex-col">
<p class="text-slate-900 dark:text-white text-sm font-bold">Tech Unboxing Video</p>
<p class="text-slate-500 dark:text-slate-400 text-xs">Oct 20, 2023</p>
</div>
</div>
<div class="flex flex-col items-end">
<p class="text-emerald-500 dark:text-emerald-400 text-sm font-bold">+$3,500.00</p>
<div class="flex items-center gap-1">
<span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
<p class="text-slate-400 text-[10px] font-medium uppercase tracking-wide">Completed</p>
</div>
</div>
</div>
</div>
</div>
</div>
<!-- Floating Action Button Area (Sticky Bottom) -->
<div class="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background-light via-background-light to-transparent dark:from-background-dark dark:via-background-dark dark:to-transparent pt-10">
<button class="w-full flex cursor-pointer items-center justify-center overflow-hidden rounded-lg h-14 bg-primary text-white text-lg font-bold leading-normal tracking-[0.015em] hover:bg-blue-600 active:scale-[0.98] transition-all shadow-lg shadow-blue-900/40">
<span class="mr-2 material-symbols-outlined">account_balance_wallet</span>
<span>Withdraw Funds</span>
</button>
<div class="h-1 w-full flex justify-center mt-2">
<div class="w-1/3 h-1 bg-slate-300 dark:bg-slate-800 rounded-full"></div>
</div>
</div>
</div>
</body></html>
```