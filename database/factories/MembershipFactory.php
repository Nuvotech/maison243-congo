<?php

namespace Database\Factories;

use App\Models\Membership;
use App\Models\Organisation;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Membership>
 */
class MembershipFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'organisation_id' => Organisation::factory(),
            'user_id' => User::factory(),
            'role' => 'Principal',
            'status' => 'Active',
            'joined_at' => now(),
        ];
    }

    /**
     * Indicate that the member is a plain agent.
     */
    public function agent(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => 'Agent',
        ]);
    }

    /**
     * Indicate that the member has been invited but has not joined yet.
     */
    public function invited(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'Invited',
            'joined_at' => null,
        ]);
    }
}
