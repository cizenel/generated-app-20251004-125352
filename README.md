# MLS ProTrack

A professional, multi-user tracking and management system with role-based access control, definition management, and SDC record tracking, fully localized in Turkish.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/cizenel/generated-app-20251004-125352)

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running Locally](#running-locally)
- [Usage](#usage)
- [Available Scripts](#available-scripts)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## Overview

MLS ProTrack is a comprehensive, multi-user management and tracking application designed for professional environments. It features a robust role-based access control (RBAC) system with three distinct user levels: Super Admin, Admin, and Regular User. The application provides a centralized dashboard for key metrics, detailed user management with CRUD operations, and specialized modules for managing definitions (like Sponsors, Centers) and tracking SDC (Source Data Capture) records. Each SDC record includes a nested list of work items, allowing for granular tracking of tasks. The system is built with a clean, minimalist, and responsive UI, supports data export to PDF and Excel, and is fully localized in Turkish.

## Key Features

-   **Robust Authentication & Authorization:** Secure login system with three distinct user roles (Super Admin, Admin, Regular User).
-   **Comprehensive User Management:** Full CRUD operations for administrators, including managing user active/inactive status.
-   **Role-Based Access Control (RBAC):** Granular permissions enforced on both the frontend and backend.
-   **Centralized Dashboard:** At-a-glance summary of key application metrics sourced from live data.
-   **Definition Management:** Admins can manage core data lists like Sponsors, Centers, Investigators, and more.
-   **Detailed SDC Tracking:** Create and manage SDC records with a nested list of "Work Done" items.
-   **Data Export:** Export user lists and SDC tracking data to PDF and Excel formats.
-   **Document Library:** Centralized access to conceptual Archive and Training PDF documents.
-   **Fully Localized:** Complete Turkish language support throughout the user interface.
-   **Modern & Responsive UI:** Clean, minimalist interface built with Tailwind CSS and shadcn/ui for a seamless experience on all devices.

## Technology Stack

-   **Frontend:** React, Vite, React Router, Tailwind CSS
-   **UI Components:** shadcn/ui, Lucide React, Framer Motion
-   **State Management:** Zustand
-   **Forms:** React Hook Form with Zod for validation
-   **Backend:** Hono on Cloudflare Workers
-   **Storage:** Cloudflare Durable Objects
-   **Language:** TypeScript
-   **Tooling:** Bun, Vite, Wrangler

## Project Structure

The project is organized into three main directories to maintain a clean separation of concerns:

-   `src/`: Contains the entire React frontend application, including pages, components, hooks, and state management.
-   `worker/`: Contains the Hono backend application that runs on Cloudflare Workers, including API routes and entity logic.
-   `shared/`: Contains shared TypeScript types and mock data used by both the frontend and backend to ensure end-to-end type safety.

## Getting Started

Follow these instructions to get the project up and running on your local machine.

### Prerequisites

-   [Bun](https://bun.sh/) installed on your system.
-   [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) logged into your Cloudflare account. You can install it globally with `bun install -g wrangler`.

### Installation

1.  Clone the repository to your local machine:
    ```sh
    git clone <repository-url>
    cd mls_protrack
    ```

2.  Install the project dependencies using Bun:
    ```sh
    bun install
    ```

### Running Locally

To start the development server for both the frontend and the backend worker, run:

```sh
bun dev
```

This will start the Vite development server for the React app and the Wrangler development server for the Hono API, typically available at `http://localhost:3000`.

## Usage

The application defines three default user roles with pre-configured credentials for initial use:

-   **Level 3 Super Admin:**
    -   **Username:** `MLS`
    -   **Password:** `2008`
    -   **Privileges:** Full access to all application features. Cannot be deleted or deactivated.

-   **Level 2 Admin User:**
    -   Can be created by the Super Admin.
    -   **Privileges:** Can manage Level 1 and other Level 2 users, and has full CRUD access to Definitions and SDC Tracking records.

-   **Level 1 Regular User:**
    -   Can be created by an Admin.
    -   **Privileges:** Can view their own profile, change their password, view Definitions, and manage only the SDC Tracking records they create.

## Available Scripts

-   `bun dev`: Starts the local development server.
-   `bun build`: Builds the frontend application for production.
-   `bun deploy`: Builds and deploys the application to Cloudflare Workers.
-   `bun lint`: Lints the codebase using ESLint.

## Deployment

This project is designed for seamless deployment to the Cloudflare ecosystem.

1.  Ensure you have installed and authenticated the Wrangler CLI.
2.  Run the deployment script:
    ```sh
    bun deploy
    ```
This command will build the Vite frontend and deploy the worker script and static assets to your Cloudflare account.

Alternatively, you can deploy directly from your GitHub repository.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/cizenel/generated-app-20251004-125352)

## Contributing

Contributions are welcome! Please feel free to open an issue or submit a pull request.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## License

This project is licensed under the MIT License. See the `LICENSE` file for more information.