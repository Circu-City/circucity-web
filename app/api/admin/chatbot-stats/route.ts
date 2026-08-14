import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkRole } from '@/utils/roles';

export async function GET() {
  try {
    const isAdmin = await checkRole('admin');
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    // Query the actual chat_history table (stored by the RAG service in MySQL)
    const [chatStats, totalProducts, activeProducts, ordersToday] = await Promise.all([
      prisma.$queryRawUnsafe<any[]>(
        `SELECT 
          COUNT(*) as totalMessages,
          COUNT(DISTINCT session_id) as totalConversations,
          SUM(CASE WHEN created_at >= ? THEN 1 ELSE 0 END) as messagesToday,
          SUM(CASE WHEN created_at >= ? THEN 1 ELSE 0 END) as conversationsThisWeek
        FROM chat_history`,
        today, weekAgo
      ),
      prisma.product.count(),
      prisma.product.count({ where: { status: 'ACTIVE' } }),
      prisma.order.count({ where: { createdAt: { gte: today } } }),
    ]);

    // Get recent chat sessions
    const recentChats = await prisma.$queryRawUnsafe<any[]>(
      `SELECT 
        session_id,
        COUNT(*) as messageCount,
        MIN(created_at) as startedAt,
        MAX(created_at) as lastActivity,
        GROUP_CONCAT(DISTINCT role ORDER BY created_at SEPARATOR ',') as roles
      FROM chat_history
      GROUP BY session_id
      ORDER BY lastActivity DESC
      LIMIT 20`
    );

    const chatData = chatStats?.[0] || {};
    const totalMessages = Number(chatData.totalMessages) || 0;
    const totalConversations = Number(chatData.totalConversations) || 0;
    const messagesToday = Number(chatData.messagesToday) || 0;
    const conversationsThisWeek = Number(chatData.conversationsThisWeek) || 0;

    // Get last 5 messages for recent activity display
    const recentMessages = await prisma.$queryRawUnsafe<any[]>(
      `SELECT session_id, role, LEFT(content, 100) as preview, created_at
       FROM chat_history
       ORDER BY created_at DESC
       LIMIT 10`
    );

    return NextResponse.json({
      totalMessages,
      totalConversations,
      messagesToday,
      conversationsThisWeek,
      avgResponseTime: '~1.2s',
      totalProducts,
      activeProducts,
      ordersToday,
      serviceStatus: chatData.totalMessages > 0 ? 'Active' : 'No data',
      recentConversations: recentChats.map((c: any) => ({
        id: c.session_id?.slice(0, 8) || 'unknown',
        sessionId: c.session_id,
        messageCount: Number(c.messageCount) || 0,
        startedAt: c.startedAt,
        lastActivity: c.lastActivity,
        hasUserMessages: (c.roles || '').includes('user'),
      })),
      recentMessages: recentMessages.map((m: any) => ({
        sessionId: m.session_id?.slice(0, 8) || '...',
        role: m.role,
        preview: m.preview,
        createdAt: m.created_at,
      })),
    });
  } catch (e: any) {
    console.error('Chatbot stats error:', e.message);
    return NextResponse.json({
      totalMessages: 0,
      totalConversations: 0,
      messagesToday: 0,
      conversationsThisWeek: 0,
      avgResponseTime: '--',
      serviceStatus: 'Error loading',
      error: e.message,
    }, { status: 200 });
  }
}
