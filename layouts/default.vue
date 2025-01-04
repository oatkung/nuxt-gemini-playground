<template>
  <div class="drawer lg:drawer-open">
    <input 
      v-model="isDrawerOpen"
      id="my-drawer-3" 
      type="checkbox" 
      class="drawer-toggle" />
    <div class="drawer-content flex flex-col">
      <!-- Navbar -->
      <div class="navbar w-full shadow">
        <div class="flex-none lg:hidden">
          <label for="my-drawer-3" aria-label="open sidebar" class="btn btn-square btn-ghost">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              class="inline-block h-6 w-6 stroke-current">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </label>
        </div>
        <AppLogo class="flex lg:hidden" />
      </div>
      <!-- Page content here -->
      <div>
        <slot></slot>
      </div>
      <!-- End page content -->
    </div>
    <div class="drawer-side">
      <label for="my-drawer-3" aria-label="close sidebar" class="drawer-overlay"></label>
      <aside class="min-h-screen bg-base-200">
        <div class="h-16 p-2 sticky top-0 bg-base-100 z-10 flex items-center">
          <AppLogo class="ml-4" />
        </div>
        <AppSidebar @close="onAppSidebarClose"/>
      </aside>
      
    </div>
  </div>
</template>

<script lang="ts" setup>
const isDrawerOpen = ref(false)

function onAppSidebarClose() {
  isDrawerOpen.value = false
}
</script>