<?php

return [
    /*
    | Base reward per reason. Set to 0 to disable a reason without removing the hook.
    */
    'rewards' => [
        'daily_login' => 5,
        'lesson_complete' => 10,
        'course_complete' => 100,
        'assessment_pass' => 25,
        'assessment_perfect_bonus' => 25,
        'profile_complete' => 50,
        'review_course' => 15,
        'discussion_thread' => 5,
        'discussion_reply' => 2,
        'first_login' => 20,
        'referral' => 30,
        // Voucher / refund credits (positive, amount dynamic via credit()).
        'redeem_refund' => 0,
        'voucher_topup' => 0,
    ],

    /*
    | Daily cap per reason. null = unlimited. Cap is checked against amount awarded
    | (including streak bonus) per calendar day per reason.
    */
    'daily_caps' => [
        'discussion_thread' => 25,
        'discussion_reply' => 30,
        'lesson_complete' => 200,
    ],

    /*
    | Streak multiplier applied on top of `daily_login` reward when user logs in
    | on consecutive days. Key = streak threshold (days), Value = bonus amount.
    | The largest threshold ≤ current streak wins. 0 = no bonus.
    */
    'streak_bonus' => [
        1 => 0,
        3 => 5,
        7 => 15,
        14 => 30,
        30 => 75,
        60 => 150,
        100 => 300,
    ],

    /*
    | Level thresholds based on lifetime points (never decreases).
    | Ordered ascending. The largest threshold ≤ lifetime_points wins.
    */
    'levels' => [
        0 => 'bronze',
        500 => 'silver',
        2000 => 'gold',
        5000 => 'platinum',
        10000 => 'diamond',
    ],
];
